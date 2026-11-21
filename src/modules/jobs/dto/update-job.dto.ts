import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateJobDto } from "./create-job.dto";

// Organization and lifecycle state are modified only through dedicated routes.
export class UpdateJobDto extends PartialType(
  OmitType(CreateJobDto, ["organizationId", "status"] as const),
) {}
