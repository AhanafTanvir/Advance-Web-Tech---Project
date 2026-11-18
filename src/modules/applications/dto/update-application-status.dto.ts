import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { ApplicationStatus } from "../entities/job-application.entity";

export class UpdateApplicationStatusDto {
  @ApiProperty({
    enum: ApplicationStatus,
    description: "New status of the job application",
    example: ApplicationStatus.ACCEPTED,
  })
  @IsEnum(ApplicationStatus, {
    message: `status must be one of the following values: ${Object.values(ApplicationStatus).join(", ")}`,
  })
  @IsNotEmpty()
  status!: ApplicationStatus;
}
