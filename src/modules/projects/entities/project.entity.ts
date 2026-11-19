import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { User } from "@/modules/users/entities/user.entity";
import { ProjectType } from "../enums/project-type.enum";
import { ProjectStatus } from "../enums/project-status.enum";
import { ProjectSkill } from "./project-skill.entity";

@Entity({ name: "projects" })
@Index("IDX_projects_client_id", ["client"])
@Index("IDX_projects_status", ["status"])
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({
    name: "client_id",
    referencedColumnName: "id",
  })
  client!: User;

  @Column({
    type: "varchar",
    length: 200,
  })
  title!: string;

  @Column({
    type: "text",
  })
  description!: string;

  @Column({
    name: "project_type",
    type: "enum",
    enum: ProjectType,
    enumName: "projects_project_type_enum",
  })
  projectType!: ProjectType;

  @Column({
    name: "budget_min",
    type: "numeric",
    precision: 12,
    scale: 2,
    nullable: true,
  })
  budgetMin!: string | null;

  @Column({
    name: "budget_max",
    type: "numeric",
    precision: 12,
    scale: 2,
    nullable: true,
  })
  budgetMax!: string | null;

  @Column({
    type: "varchar",
    length: 3,
    default: "BDT",
  })
  currency!: string;

  @Column({
    type: "enum",
    enum: ProjectStatus,
    enumName: "projects_status_enum",
    default: ProjectStatus.DRAFT,
  })
  status!: ProjectStatus;

  @Column({
    type: "date",
    nullable: true,
  })
  deadline!: string | null;

  @OneToMany(() => ProjectSkill, (projectSkill) => projectSkill.project)
  projectSkills!: ProjectSkill[];

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz",
  })
  updatedAt!: Date;
}