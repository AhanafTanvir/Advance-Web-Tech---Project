<<<<<<< HEAD
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { AuthUser } from "../../common/interfaces/auth-user.interface";
import { OrganizationsService } from "../organizations/organizations.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { QueryJobDto } from "./dto/query-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
=======
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
>>>>>>> origin/feature/organizations
import { Job } from "./entities/job.entity";

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
<<<<<<< HEAD
    private readonly jobsRepository: Repository<Job>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(dto: CreateJobDto, user: AuthUser): Promise<Job> {
    await this.assertOrganizationOwner(user.id, dto.organizationId);
    const job = this.jobsRepository.create(dto);
    return this.jobsRepository.save(job);
  }

  async findAll(query: QueryJobDto) {
    const { page, limit, jobType, location, search } = query;
    const qb = this.jobsRepository
      .createQueryBuilder("job")
      .leftJoinAndSelect("job.organization", "organization");

    if (jobType) qb.andWhere("job.jobType = :jobType", { jobType });
    if (location) {
      qb.andWhere("job.location ILIKE :location", {
        location: `%${location.trim()}%`,
      });
    }
    if (search?.trim()) {
      const searchTerm = `%${search.trim()}%`;
      qb.andWhere(
        new Brackets((where) => {
          where
            .where("job.title ILIKE :searchTerm", { searchTerm })
            .orWhere("job.description ILIKE :searchTerm", { searchTerm })
            .orWhere("organization.name ILIKE :searchTerm", { searchTerm });
        }),
      );
    }

    const [data, total] = await qb
      .orderBy("job.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobsRepository.findOne({
      where: { id },
      relations: { organization: true },
    });
    if (!job) throw new NotFoundException(`Job with ID ${id} not found`);
    return job;
  }

  async update(id: string, dto: UpdateJobDto, user: AuthUser): Promise<Job> {
    const job = await this.findOne(id);
    await this.assertOrganizationOwner(user.id, job.organizationId);
    Object.assign(job, dto);
    return this.jobsRepository.save(job);
  }

  async remove(id: string, user: AuthUser) {
    const job = await this.findOne(id);
    if (!user.roles.includes("ADMIN")) {
      await this.assertOrganizationOwner(user.id, job.organizationId);
    }
    await this.jobsRepository.remove(job);
    return { message: `Job with ID ${id} has been removed successfully` };
  }

  private async assertOrganizationOwner(
    userId: string,
    organizationId: string,
  ): Promise<void> {
    // findOne also gives the expected 404 when the organization does not exist.
    await this.organizationsService.findOne(organizationId);
    const isOwner = await this.organizationsService.isOrgOwner(
      userId,
      organizationId,
    );
    if (!isOwner) {
      throw new ForbiddenException("You do not own this organization");
    }
  }
=======
    private readonly jobRepository: Repository<Job>,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    const [data, total] = await this.jobRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ["organization"],
    });
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ["organization"],
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }
>>>>>>> origin/feature/organizations
}
