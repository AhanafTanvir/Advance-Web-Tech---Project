import {
  Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe,
  Patch, Post, Query, UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtGuard, RolesGuard } from "../../common/guard";
import { AuthUser } from "../../common/interfaces/auth-user.interface";
import { Role } from "../../common/enums/role.enum";
import { CreateJobDto } from "./dto/create-job.dto";
import { QueryJobDto } from "./dto/query-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { JobsService } from "./jobs.service";

@ApiTags("Jobs")
@Controller("jobs")
export class JobsController {
  constructor(private readonly service: JobsService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create job (organization owner employer)" })
  create(@Body() dto: CreateJobDto, @CurrentUser() actor: AuthUser) {
    return this.service.create(dto, actor);
  }

  @Get()
  @ApiOperation({ summary: "Search and filter open, non-expired job listings" })
  list(@Query() filters: QueryJobDto) {
    return this.service.findAll(filters);
  }

  // Static route MUST be before /:id.
  @Get("mine")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  mine(@CurrentUser() actor: AuthUser) {
    return this.service.mine(actor);
  }

  @Get(":id")
  get(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateJobDto,
    @CurrentUser() actor: AuthUser) {
    return this.service.update(id, dto, actor);
  }

  @Patch(":id/publish")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  publish(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() actor: AuthUser) {
    return this.service.publish(id, actor);
  }

  @Patch(":id/close")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  close(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() actor: AuthUser) {
    return this.service.close(id, actor);
  }

  @Delete(":id")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  remove(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() actor: AuthUser) {
    return this.service.remove(id, actor);
  }
}
