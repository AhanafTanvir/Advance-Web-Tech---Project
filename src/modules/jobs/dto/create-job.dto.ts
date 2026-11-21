import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { JobStatus, JobType } from "../entities/job.entity";

export class CreateJobDto {
  @ApiProperty({ description: "UUID of the employer's organization" })
  @IsUUID()
  organizationId!: string;

  @ApiProperty({ example: "Software Engineer" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title!: string;

  @ApiProperty({ example: "Develop REST APIs using NestJS and PostgreSQL." })
  @IsString()
  @MinLength(10)
  description!: string;

  @ApiProperty({ enum: JobType })
  @IsEnum(JobType)
  jobType!: JobType;

  @ApiProperty({ example: "Dhaka" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location!: string;

  @ApiPropertyOptional({ enum: JobStatus, default: JobStatus.OPEN })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({ example: "2027-01-15T17:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}
