import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";
import { JobType } from "../entities/job.entity";

export class QueryJobDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit = 10;

  @ApiPropertyOptional({ enum: JobType })
  @IsOptional() @IsEnum(JobType)
  jobType?: JobType;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  location?: string;

  @ApiPropertyOptional({ description: "Search title, description and organization name" })
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "Alternative keyword parameter used in the original prototype" })
  @IsOptional() @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUUID()
  organizationId?: string;
}
