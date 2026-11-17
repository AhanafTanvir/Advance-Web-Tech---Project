
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ProfessionalProfile } from "./entities/professional-profile.entity";
import { Skill } from "./entities/skill.entity";
import { ProfileSkill } from "./entities/profile-skill.entity";
import { Experience } from "./entities/experience.entity";
import { Education } from "./entities/education.entity";
import { PortfolioItem } from "./entities/portfolio-item.entity";

import { ProfilesService } from "./profiles.service";
import { ProfilesController } from "./profiles.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfessionalProfile,
      Skill,
      ProfileSkill,
      Experience,
      Education,
      PortfolioItem,
    ]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService, TypeOrmModule],
})
export class ProfilesModule {}
