import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Project } from "./entities/project.entity";
import { ProjectSkill } from "./entities/project-skill.entity";
import { Skill } from "@/modules/profiles/entities/skill.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectSkill,
      Skill,
    ]),
  ],
})
export class ProjectsModule {}