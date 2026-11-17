
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { User } from "@/modules/users/entities/user.entity";
import { ProfileSkill } from "./profile-skill.entity";
import { Experience } from "./experience.entity";
import { Education } from "./education.entity";
import { PortfolioItem } from "./portfolio-item.entity";

@Entity({ name: "professional_profiles" })
export class ProfessionalProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @OneToOne(() => User, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "user_id",
    referencedColumnName: "id",
  })
  user!: User;

  @Column({
    type: "varchar",
    length: 200,
    nullable: true,
  })
  headline!: string | null;

  @Column({
    type: "text",
    nullable: true,
  })
  bio!: string | null;

  @Column({
    type: "varchar",
    length: 150,
    nullable: true,
  })
  location!: string | null;

  @Column({
    name: "resume_url",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  resumeUrl!: string | null;

  @OneToMany(() => ProfileSkill, (profileSkill) => profileSkill.profile)
  profileSkills!: ProfileSkill[];

  @OneToMany(() => Experience, (experience) => experience.profile)
  experiences!: Experience[];

  @OneToMany(() => Education, (education) => education.profile)
  educations!: Education[];

  @OneToMany(() => PortfolioItem, (portfolioItem) => portfolioItem.profile)
  portfolioItems!: PortfolioItem[];

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
