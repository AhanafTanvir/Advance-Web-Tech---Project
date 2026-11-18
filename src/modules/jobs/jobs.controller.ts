import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, Roles } from "../../common/decorators";
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
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  create(@Body() dto: CreateJobDto, @CurrentUser() user: AuthUser) {
    return this.jobsService.create(dto, user);
  }

  @Get()
  findAll(@Query() query: QueryJobDto) {
    return this.jobsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.jobsService.update(id, dto, user);
  }

  @Delete(":id")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.EMPLOYER, Role.ADMIN)
  @ApiBearerAuth()
  remove(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.jobsService.remove(id, user);
  }
}
