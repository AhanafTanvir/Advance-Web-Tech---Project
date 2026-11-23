import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { ApplicationStatus } from "../entities/job-application.entity";

const employerStatuses = [
  ApplicationStatus.REVIEWING,
  ApplicationStatus.ACCEPTED,
  ApplicationStatus.REJECTED,
];

export class UpdateApplicationStatusDto {
  @ApiProperty({ enum: employerStatuses })
  @IsIn(employerStatuses)
  status!: ApplicationStatus;

  @ApiPropertyOptional({ example: "Shortlisted for interview" })
  @IsOptional() @IsString() @MaxLength(1000)
  note?: string;
}
