
import {
  Body,
  Controller,
  Post,
  UseGuards,
} from "@nestjs/common";

import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";

import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { AuthUser } from "@/common/interfaces/auth-user.interface";

@Controller("projects")
@UseGuards(JwtGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(Role.EMPLOYER, Role.ADMIN)
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(user.id, dto);
  }
}
