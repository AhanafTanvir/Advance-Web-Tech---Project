import { Controller, Get, Param, ParseUUIDPipe, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { JobsService } from "./jobs.service";

@ApiTags("Jobs")
@Controller("jobs")
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: "Get all jobs with pagination" })
  findAll(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    return this.jobsService.findAll(+page, +limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get job by ID" })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.jobsService.findOne(id);
  }
}
