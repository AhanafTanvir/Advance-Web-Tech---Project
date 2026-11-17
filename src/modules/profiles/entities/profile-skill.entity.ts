
import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from "typeorm";

import { ProfessionalProfile } from "./professional-profile.entity";
import { Skill } from "./skill.entity";

export enum SkillProficiency {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
  EXPERT = "EXPERT",
}

@Entity({ name: "profile_skills" })
@Index(
  "UQ_profile_skills_profile_skill",
  ["profile", "skill"],
  { unique: true },
)
export class ProfileSkill {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => ProfessionalProfile, (profile) => profile.profileSkills, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "profile_id",
    referencedColumnName: "id",
  })
  profile!: ProfessionalProfile;

  @ManyToOne(() => Skill, (skill) => skill.profileSkills, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({
    name: "skill_id",
    referencedColumnName: "id",
  })
  skill!: Skill;

  @Column({
    type: "enum",
    enum: SkillProficiency,
    enumName: "profile_skills_proficiency_enum",
  })
  proficiency!: SkillProficiency;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
  })
  createdAt!: Date;
}
