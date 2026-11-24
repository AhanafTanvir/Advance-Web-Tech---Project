import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, DataSource, Repository } from "typeorm";
import { AuthUser } from "../../common/interfaces/auth-user.interface";
import { Role } from "../../common/enums/role.enum";
import { OrganizationsService } from "../organizations/organizations.service";
import { Job, JobStatus } from "./entities/job.entity";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { QueryJobDto } from "./dto/query-job.dto";

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job) private readonly jobsRepository: Repository<Job>,
    private readonly organizationsService: OrganizationsService,
    private readonly dataSource: DataSource,
  ) {}

  private async requireOwner(organizationId: string, actor: AuthUser): Promise<void> {
    if (!actor?.id || !actor.roles?.includes(Role.EMPLOYER)) {
      throw new ForbiddenException("An authenticated EMPLOYER is required");
    }
    await this.organizationsService.findOne(organizationId);
    const isOwner = await this.organizationsService.isOrgOwner(actor.id, organizationId);
    if (!isOwner) throw new ForbiddenException("Only the organization owner may manage its jobs");
  }

  private validateDeadline(deadline?: string): void {
    if (deadline && new Date(deadline).getTime() <= Date.now()) {
      throw new BadRequestException("Deadline must be in the future");
    }
  }

  async create(dto: CreateJobDto, actor: AuthUser): Promise<Job> {
    await this.requireOwner(dto.organizationId, actor);
    this.validateDeadline(dto.deadline);
    if (dto.status === JobStatus.CLOSED) {
      throw new BadRequestException("A newly created job cannot be CLOSED");
    }
    const job = this.jobsRepository.create({
      organizationId: dto.organizationId,
      title: dto.title,
      description: dto.description,
      jobType: dto.jobType,
      location: dto.location,
      status: dto.status ?? JobStatus.OPEN,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
    });
    return this.jobsRepository.save(job);
  }

  async findAll(query: QueryJobDto) {
    const { page, limit, jobType, location, organizationId } = query;
    const term = (query.search || query.q || "").trim();
    const qb = this.jobsRepository
      .createQueryBuilder("job")
      .leftJoinAndSelect("job.organization", "organization")
      .where("job.status = :status", { status: JobStatus.OPEN })
      .andWhere("(job.deadline IS NULL OR job.deadline > NOW())");
    if (jobType) qb.andWhere("job.jobType = :jobType", { jobType });
    if (location?.trim()) qb.andWhere("job.location ILIKE :location", { location: `%${location.trim()}%` });
    if (organizationId) qb.andWhere("job.organizationId = :organizationId", { organizationId });
    if (term) {
      qb.andWhere(new Brackets((w) => w.where("job.title ILIKE :term", { term: `%${term}%` })
        .orWhere("job.description ILIKE :term", { term: `%${term}%` })
        .orWhere("organization.name ILIKE :term", { term: `%${term}%` })));
    }
    const [data, total] = await qb.orderBy("job.createdAt", "DESC")
      .skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobsRepository.findOne({ where: { id }, relations: { organization: true } });
    if (!job || job.status !== JobStatus.OPEN || (job.deadline && job.deadline.getTime() <= Date.now())) {
      throw new NotFoundException("Open job not found");
    }
    return job;
  }

  private async ownedJob(id: string, actor: AuthUser): Promise<Job> {
    const job = await this.jobsRepository.findOneBy({ id });
    if (!job) throw new NotFoundException("Job not found");
    await this.requireOwner(job.organizationId, actor);
    return job;
  }

  async mine(actor: AuthUser) {
    if (!actor?.id || !actor.roles?.includes(Role.EMPLOYER)) {
      throw new ForbiddenException("EMPLOYER role required");
    }
    // Membership column names come from the TEAM schema and use quoted camelCase.
    const rows: Job[] = await this.dataSource.query(
      `SELECT j.* FROM public.jobs j
       JOIN public.organization_memberships m ON m."organizationId" = j.organization_id
       WHERE m."userId" = $1 AND m.role::text = 'OWNER'
       ORDER BY j.created_at DESC`, [actor.id],
    );
    return rows;
  }

  async update(id: string, dto: UpdateJobDto, actor: AuthUser): Promise<Job> {
    const job = await this.ownedJob(id, actor);
    if (job.status === JobStatus.CLOSED) throw new ConflictException("Closed jobs cannot be edited");
    this.validateDeadline(dto.deadline);
    Object.assign(job, { ...dto, ...(dto.deadline ? { deadline: new Date(dto.deadline) } : {}) });
    return this.jobsRepository.save(job);
  }

  async publish(id: string, actor: AuthUser): Promise<Job> {
    const job = await this.ownedJob(id, actor);
    if (job.status !== JobStatus.DRAFT) throw new ConflictException("Only drafts can be published");
    if (job.deadline && job.deadline.getTime() <= Date.now()) throw new ConflictException("Deadline expired");
    job.status = JobStatus.OPEN;
    return this.jobsRepository.save(job);
  }

  async close(id: string, actor: AuthUser): Promise<Job> {
    const job = await this.ownedJob(id, actor);
    if (job.status === JobStatus.CLOSED) throw new ConflictException("Job already closed");
    job.status = JobStatus.CLOSED;
    return this.jobsRepository.save(job);
  }

  async remove(id: string, actor: AuthUser) {
    const job = await this.ownedJob(id, actor);
    if (job.status !== JobStatus.DRAFT) throw new ConflictException("Only draft jobs can be deleted");
    // RESTRICT any deletion when submitted applications exist; never erase applicant history.
    const count = await this.dataSource.query(
      "SELECT 1 FROM public.job_applications WHERE job_id = $1 LIMIT 1", [id],
    );
    if (count.length) throw new ConflictException("Job with applications cannot be deleted");
    await this.jobsRepository.delete(id);
    return { id, message: "Draft job deleted" };
  }
}
