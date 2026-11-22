import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";

import { Project } from "./entities/project.entity";
import { ProjectSkill } from "./entities/project-skill.entity";
import { Skill } from "@/modules/profiles/entities/skill.entity";
import { User } from "@/modules/users/entities/user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectSkill,
      Skill,
      User,
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}