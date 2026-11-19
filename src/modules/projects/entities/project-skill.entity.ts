
import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Skill } from "@/modules/profiles/entities/skill.entity";
import { Project } from "./project.entity";

@Entity({ name: "project_skills" })
@Index(
  "UQ_project_skills_project_skill",
  ["project", "skill"],
  { unique: true },
)
export class ProjectSkill {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Project, (project) => project.projectSkills, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "project_id",
    referencedColumnName: "id",
  })
  project!: Project;

  @ManyToOne(() => Skill, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({
    name: "skill_id",
    referencedColumnName: "id",
  })
  skill!: Skill;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
  })
  createdAt!: Date;
}
