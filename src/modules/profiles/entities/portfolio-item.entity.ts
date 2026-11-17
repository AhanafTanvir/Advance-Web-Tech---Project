
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { ProfessionalProfile } from "./professional-profile.entity";

@Entity({ name: "portfolio_items" })
@Index("IDX_portfolio_items_profile_id", ["profile"])
export class PortfolioItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => ProfessionalProfile, (profile) => profile.portfolioItems, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "profile_id",
    referencedColumnName: "id",
  })
  profile!: ProfessionalProfile;

  @Column({
    type: "varchar",
    length: 200,
  })
  title!: string;

  @Column({
    type: "text",
    nullable: true,
  })
  description!: string | null;

  @Column({
    name: "project_url",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  projectUrl!: string | null;

  @Column({
    name: "repository_url",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  repositoryUrl!: string | null;

  @Column({
    type: "text",
    array: true,
    default: () => "'{}'",
  })
  technologies!: string[];

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
