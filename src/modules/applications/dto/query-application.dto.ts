import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { ApplicationStatus } from "../entities/job-application.entity";

export class QueryApplicationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit = 10;

  @ApiPropertyOptional({ enum: ApplicationStatus })
  @IsOptional() @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;
}
