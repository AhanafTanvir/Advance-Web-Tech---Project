import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { AuthUser } from "@/common/interfaces/auth-user.interface";
import { ApplicationsService } from "./applications.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";
import { QueryApplicationDto } from "./dto/query-application.dto";
import { ApplicationStatus } from "./entities/job-application.entity";

interface AuthenticatedRequest {
  user: AuthUser;
}

@ApiTags("Applications")
@ApiBearerAuth()
@Controller()
@UseGuards(JwtGuard)
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
  ) {}

  // 1. POST /jobs/:jobId/applications (Access: JOB_SEEKER, returns 201)
  @Post("jobs/:jobId/applications")
  @UseGuards(RolesGuard)
  @Roles(Role.JOB_SEEKER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Apply for a job (Job Seeker only)",
    description: "Submit a new job application for the specified job. Returns 409 if already applied.",
  })
  @ApiParam({ name: "jobId", type: "string", format: "uuid", description: "Target Job UUID" })
  @ApiResponse({ status: 201, description: "Application successfully submitted" })
  @ApiResponse({ status: 400, description: "Bad Request - invalid body or param" })
  @ApiResponse({ status: 401, description: "Unauthorized - missing or invalid token" })
  @ApiResponse({ status: 403, description: "Forbidden - user is not a job seeker" })
  @ApiResponse({ status: 404, description: "Not Found - job does not exist" })
  @ApiResponse({ status: 409, description: "Conflict - user already applied to this job" })
  async create(
    @Param("jobId", ParseUUIDPipe) jobId: string,
    @Body() dto: CreateApplicationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.applicationsService.create(jobId, dto, req.user);
  }

  // 2. GET /applications/me (Access: JOB_SEEKER, returns 200)
  @Get("applications/me")
  @UseGuards(RolesGuard)
  @Roles(Role.JOB_SEEKER)
  @ApiOperation({
    summary: "Get current job seeker's applications",
    description: "Retrieve a paginated list of all job applications submitted by the current user.",
  })
  @ApiQuery({ name: "page", required: false, type: Number, description: "Page number (default: 1)" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Items per page (default: 10)" })
  @ApiQuery({ name: "status", required: false, enum: ApplicationStatus, description: "Filter by application status" })
  @ApiResponse({ status: 200, description: "List of user applications retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized - missing or invalid token" })
  @ApiResponse({ status: 403, description: "Forbidden - user is not a job seeker" })
  async findMyApplications(
    @Query() query: QueryApplicationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.applicationsService.findMyApplications(req.user.id, query);
  }

  // 3. GET /jobs/:jobId/applications (Access: Owner EMPLOYER, returns 200)
  @Get("jobs/:jobId/applications")
  @UseGuards(RolesGuard)
  @Roles(Role.EMPLOYER)
  @ApiOperation({
    summary: "Get applications for a job (Job owner employer only)",
    description: "Retrieve all applicant submissions for a job owned by the logged-in employer.",
  })
  @ApiParam({ name: "jobId", type: "string", format: "uuid", description: "Target Job UUID" })
  @ApiQuery({ name: "page", required: false, type: Number, description: "Page number (default: 1)" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Items per page (default: 10)" })
  @ApiQuery({ name: "status", required: false, enum: ApplicationStatus, description: "Filter by status" })
  @ApiResponse({ status: 200, description: "List of job applications retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - user is not the job owner employer" })
  @ApiResponse({ status: 404, description: "Not Found - job does not exist" })
  async findByJob(
    @Param("jobId", ParseUUIDPipe) jobId: string,
    @Query() query: QueryApplicationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.applicationsService.findByJob(jobId, req.user.id, query);
  }

  // 4. GET /applications/:id (Access: Applicant or job owner, returns 200)
  @Get("applications/:id")
  @ApiOperation({
    summary: "Get application details by ID (Applicant or job owner)",
    description: "Retrieve single application details. Accessible by applicant or job owner employer.",
  })
  @ApiParam({ name: "id", type: "string", format: "uuid", description: "Job Application UUID" })
  @ApiResponse({ status: 200, description: "Application details retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - user is neither applicant nor job owner" })
  @ApiResponse({ status: 404, description: "Not Found - application does not exist" })
  async findOne(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.applicationsService.findOne(id, req.user);
  }

  // 5. PATCH /applications/:id/status (Access: Job owner EMPLOYER, returns 200)
  @Patch("applications/:id/status")
  @UseGuards(RolesGuard)
  @Roles(Role.EMPLOYER)
  @ApiOperation({
    summary: "Update application status (Job owner employer only)",
    description: "Update the status of an application (e.g. REVIEWING, ACCEPTED, REJECTED).",
  })
  @ApiParam({ name: "id", type: "string", format: "uuid", description: "Job Application UUID" })
  @ApiResponse({ status: 200, description: "Application status updated successfully" })
  @ApiResponse({ status: 400, description: "Bad Request - invalid status value" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - user is not the job owner" })
  @ApiResponse({ status: 404, description: "Not Found - application does not exist" })
  async updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.applicationsService.updateStatus(id, dto, req.user);
  }

  // 6. DELETE /applications/:id (Access: Applicant withdraw, returns 200)
  @Delete("applications/:id")
  @ApiOperation({
    summary: "Withdraw job application (Applicant only)",
    description: "Withdraw / cancel a previously submitted job application.",
  })
  @ApiParam({ name: "id", type: "string", format: "uuid", description: "Job Application UUID" })
  @ApiResponse({ status: 200, description: "Application withdrawn successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - user is not the applicant" })
  @ApiResponse({ status: 404, description: "Not Found - application does not exist" })
  async remove(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.applicationsService.remove(id, req.user);
  }
}
