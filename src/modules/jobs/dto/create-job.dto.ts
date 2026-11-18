import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";
import { JobType } from "../entities/job.entity";

export class CreateJobDto {
  @ApiProperty({ description: "UUID of the organization posting this job" })
  @IsUUID()
  organizationId!: string;

  @ApiProperty({ description: "Job title", maxLength: 180 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title!: string;

  @ApiProperty({ description: "Full job description" })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: JobType, description: "Employment type" })
  @IsEnum(JobType)
  jobType!: JobType;

  @ApiProperty({ description: "Job location (city, remote, etc.)", maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location!: string;
}
