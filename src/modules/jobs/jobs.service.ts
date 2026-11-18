import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Job } from "./entities/job.entity";

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
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
}
