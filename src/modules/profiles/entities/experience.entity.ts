
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

@Entity({ name: "experiences" })
@Index("IDX_experiences_profile_id", ["profile"])
export class Experience {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => ProfessionalProfile, (profile) => profile.experiences, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "profile_id",
    referencedColumnName: "id",
  })
  profile!: ProfessionalProfile;

  @Column({
    type: "varchar",
    length: 150,
  })
  organization!: string;

  @Column({
    name: "job_title",
    type: "varchar",
    length: 150,
  })
  jobTitle!: string;

  @Column({
    name: "employment_type",
    type: "varchar",
    length: 50,
    nullable: true,
  })
  employmentType!: string | null;

  @Column({
    type: "varchar",
    length: 150,
    nullable: true,
  })
  location!: string | null;

  @Column({
    name: "start_date",
    type: "date",
  })
  startDate!: string;

  @Column({
    name: "end_date",
    type: "date",
    nullable: true,
  })
  endDate!: string | null;

  @Column({
    name: "is_current",
    type: "boolean",
    default: false,
  })
  isCurrent!: boolean;

  @Column({
    type: "text",
    nullable: true,
  })
  description!: string | null;

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
