
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { ProfileSkill } from "./profile-skill.entity";

@Entity({ name: "skills" })
@Index("UQ_skills_name", ["name"], { unique: true })
export class Skill {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "varchar",
    length: 100,
  })
  name!: string;

  @Column({
    type: "varchar",
    length: 100,
    nullable: true,
  })
  category!: string | null;

  @OneToMany(() => ProfileSkill, (profileSkill) => profileSkill.skill)
  profileSkills!: ProfileSkill[];

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
  })
  createdAt!: Date;
}
