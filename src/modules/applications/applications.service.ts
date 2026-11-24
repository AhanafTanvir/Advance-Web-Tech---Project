import {
  ConflictException, ForbiddenException, Injectable, NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, Repository } from "typeorm";
import { AuthUser } from "../../common/interfaces/auth-user.interface";
import { Role } from "../../common/enums/role.enum";
import { OrganizationsService } from "../organizations/organizations.service";
import { Job, JobStatus } from "../jobs/entities/job.entity";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { QueryApplicationDto } from "./dto/query-application.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";
import { ApplicationStatusHistory } from "./entities/application-status-history.entity";
import { ApplicationStatus, JobApplication } from "./entities/job-application.entity";

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(JobApplication) private readonly applications: Repository<JobApplication>,
    @InjectRepository(Job) private readonly jobs: Repository<Job>,
    private readonly organizationsService: OrganizationsService,
    private readonly dataSource: DataSource,
  ) {}

  private async requireOwner(orgId: string, user: AuthUser): Promise<void> {
    if (!user.roles?.includes(Role.EMPLOYER) && !user.roles?.includes(Role.ADMIN)) {
      throw new ForbiddenException("Employer role required");
    }
    if (user.roles?.includes(Role.ADMIN)) return;
    if (!await this.organizationsService.isOrgOwner(user.id, orgId)) {
      throw new ForbiddenException("You do not own this organization");
    }
  }

  private isTerminal(status: ApplicationStatus): boolean {
    return status === ApplicationStatus.ACCEPTED || status === ApplicationStatus.REJECTED
      || status === ApplicationStatus.WITHDRAWN;
  }

  async create(jobId: string, dto: CreateApplicationDto, user: AuthUser) {
    const job = await this.jobs.findOneBy({ id: jobId });
    if (!job) throw new NotFoundException("Job not found");
    if (job.status !== JobStatus.OPEN || (job.deadline && job.deadline.getTime() <= Date.now())) {
      throw new ConflictException("This job is not open for applications");
    }
    if (!user.roles?.includes(Role.JOB_SEEKER)) {
      throw new ForbiddenException("Only job seekers can apply");
    }
    try {
      return await this.dataSource.transaction(async (manager) => {
        const repo = manager.getRepository(JobApplication);
        const existing = await repo.findOneBy({ jobId, applicantId: user.id });
        if (existing) throw new ConflictException("You have already applied for this job");
        const app = await repo.save(repo.create({
          jobId, applicantId: user.id, coverLetter: dto.coverLetter,
          resumeUrl: dto.resumeUrl, status: ApplicationStatus.PENDING, withdrawnAt: null,
        }));
        await manager.getRepository(ApplicationStatusHistory).save({
          applicationId: app.id, fromStatus: null, toStatus: ApplicationStatus.PENDING,
          changedBy: user.id, note: "Application submitted",
        });
        return app;
      });
    } catch (error: unknown) {
      const pgError = error as { code?: string; driverError?: { code?: string } };
      if (pgError.code === "23505" || pgError.driverError?.code === "23505") {
        throw new ConflictException("You have already applied for this job");
      }
      throw error;
    }
  }

  async findMyApplications(userId: string, query: QueryApplicationDto) {
    const page = query.page ?? 1, limit = query.limit ?? 10;
    const qb = this.applications.createQueryBuilder("application")
      .leftJoinAndSelect("application.job", "job")
      .where("application.applicantId = :userId", { userId });
    if (query.status) qb.andWhere("application.status = :status", { status: query.status });
    const [data, total] = await qb.orderBy("application.createdAt", "DESC")
      .skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByJob(jobId: string, userId: string, query: QueryApplicationDto) {
    const job = await this.jobs.findOneBy({ id: jobId });
    if (!job) throw new NotFoundException("Job not found");
    if (!await this.organizationsService.isOrgOwner(userId, job.organizationId)) {
      throw new ForbiddenException("Not authorized to view applications for this job");
    }
    const page = query.page ?? 1, limit = query.limit ?? 10;
    const qb = this.applications.createQueryBuilder("application")
      .where("application.jobId = :jobId", { jobId });
    if (query.status) qb.andWhere("application.status = :status", { status: query.status });
    const [data, total] = await qb.orderBy("application.createdAt", "DESC")
      .skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, user: AuthUser) {
    const app = await this.applications.findOne({
      where: { id },
      relations: { job: true, statusHistory: true },
    });
    if (!app) throw new NotFoundException("Application not found");
    if (app.applicantId !== user.id && !user.roles?.includes(Role.ADMIN)) {
      await this.requireOwner(app.job.organizationId, user);
    }
    app.statusHistory?.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return app;
  }

  async updateStatus(id: string, dto: UpdateApplicationStatusDto, user: AuthUser) {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(JobApplication);
      const app = await repo.createQueryBuilder("a")
        .where("a.id = :id", { id }).setLock("pessimistic_write").getOne();
      if (!app) throw new NotFoundException("Application not found");
      const job = await manager.getRepository(Job).findOneBy({ id: app.jobId });
      if (!job) throw new NotFoundException("Job not found");
      await this.requireOwner(job.organizationId, user);
      if (this.isTerminal(app.status)) throw new ConflictException("Application has a final status");
      if (app.status === dto.status) throw new ConflictException("Application is already in that status");
      const previous = app.status;
      app.status = dto.status;
      await repo.save(app);
      await manager.getRepository(ApplicationStatusHistory).save({
        applicationId: app.id, fromStatus: previous, toStatus: dto.status,
        changedBy: user.id, note: dto.note ?? null,
      });
      return app;
    });
  }

  async remove(id: string, user: AuthUser) {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(JobApplication);
      const app = await repo.createQueryBuilder("a")
        .where("a.id = :id", { id }).setLock("pessimistic_write").getOne();
      if (!app) throw new NotFoundException("Application not found");
      if (app.applicantId !== user.id) throw new ForbiddenException("You can only withdraw your own application");
      if (this.isTerminal(app.status)) throw new ConflictException("Application cannot be withdrawn");
      const previous = app.status;
      app.status = ApplicationStatus.WITHDRAWN;
      app.withdrawnAt = new Date();
      await repo.save(app);
      await manager.getRepository(ApplicationStatusHistory).save({
        applicationId: app.id, fromStatus: previous, toStatus: ApplicationStatus.WITHDRAWN,
        changedBy: user.id, note: "Applicant withdrew",
      });
      return { id: app.id, status: app.status, message: "Application withdrawn" };
    });
  }
}
