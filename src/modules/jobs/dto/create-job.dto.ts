import { IsEnum, IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";
import { JobType } from "../entities/job.entity";

export class CreateJobDto {
  @IsUUID()
  organizationId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(JobType)
  jobType!: JobType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location!: string;
}
