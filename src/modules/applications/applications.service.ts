import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  ApplicationStatus,
  JobApplication,
} from "./entities/job-application.entity";
import { Job } from "../jobs/entities/job.entity";
import { OrganizationsService } from "../organizations/organizations.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";
import { QueryApplicationDto } from "./dto/query-application.dto";
import { AuthUser } from "@/common/interfaces/auth-user.interface";
import { Role } from "@/common/enums/role.enum";

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,

    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,

    private readonly organizationsService: OrganizationsService,
  ) {}

  // 1. POST /jobs/:jobId/applications (Access: JOB_SEEKER)
  async create(
    jobId: string,
    dto: CreateApplicationDto,
    user: AuthUser,
  ): Promise<JobApplication> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    const existing = await this.applicationRepository.findOne({
      where: {
        jobId,
        applicantId: user.id,
      },
    });

    if (existing) {
      throw new ConflictException(
        "You have already submitted an application for this job",
      );
    }

    const application = this.applicationRepository.create({
      jobId,
      applicantId: user.id,
      resumeUrl: dto.resumeUrl,
      coverLetter: dto.coverLetter,
      status: ApplicationStatus.PENDING,
    });

    try {
      return await this.applicationRepository.save(application);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "23505"
      ) {
        throw new ConflictException(
          "You have already submitted an application for this job",
        );
      }
      throw error;
    }
  }

  // 2. GET /applications/me (Access: JOB_SEEKER)
  async findMyApplications(userId: string, query: QueryApplicationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.applicationRepository.findAndCount({
      where: { applicantId: userId },
      relations: ["job", "job.organization"],
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  // 3. GET /jobs/:jobId/applications (Access: Owner EMPLOYER)
  async findByJob(
    jobId: string,
    userId: string,
    query: QueryApplicationDto,
  ) {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    const isOwner = await this.organizationsService.isOrgOwner(
      userId,
      job.organizationId,
    );

    if (!isOwner) {
      throw new ForbiddenException(
        "You do not have permission to view applications for this job",
      );
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.applicationRepository.findAndCount({
      where: { jobId },
      relations: ["applicant"],
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  // 4. GET /applications/:id (Access: Applicant or job owner)
  async findOne(id: string, user: AuthUser): Promise<JobApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ["job", "job.organization", "applicant"],
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    const isApplicant = application.applicantId === user.id;
    const isAdmin = user.roles?.includes(Role.ADMIN);
    const isJobOwner = application.job?.organizationId
      ? await this.organizationsService.isOrgOwner(
          user.id,
          application.job.organizationId,
        )
      : false;

    if (!isApplicant && !isJobOwner && !isAdmin) {
      throw new ForbiddenException(
        "You do not have permission to view this application",
      );
    }

    return application;
  }

  // 5. PATCH /applications/:id/status (Access: Job owner EMPLOYER)
  async updateStatus(
    id: string,
    dto: UpdateApplicationStatusDto,
    user: AuthUser,
  ): Promise<JobApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ["job"],
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    const isAdmin = user.roles?.includes(Role.ADMIN);
    const isJobOwner = application.job?.organizationId
      ? await this.organizationsService.isOrgOwner(
          user.id,
          application.job.organizationId,
        )
      : false;

    if (!isJobOwner && !isAdmin) {
      throw new ForbiddenException(
        "You do not have permission to update this application status",
      );
    }

    application.status = dto.status;
    return await this.applicationRepository.save(application);
  }

  // 6. DELETE /applications/:id (Access: Applicant withdraw)
  async remove(id: string, user: AuthUser): Promise<{ message: string }> {
    const application = await this.applicationRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    const isApplicant = application.applicantId === user.id;
    const isAdmin = user.roles?.includes(Role.ADMIN);

    if (!isApplicant && !isAdmin) {
      throw new ForbiddenException(
        "You can only withdraw your own applications",
      );
    }

    await this.applicationRepository.remove(application);

    return {
      message: "Application withdrawn successfully",
    };
  }
}
