import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Organization } from "../../organizations/entities/organization.entity";
import { JobApplication } from "../../applications/entities/job-application.entity";

export enum JobType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  REMOTE = "REMOTE",
  INTERNSHIP = "INTERNSHIP",
}

@Entity({ name: "jobs" })
export class Job {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "varchar",
    length: 150,
  })
  title!: string;

  @Column({
    type: "text",
  })
  description!: string;

  @Column({
    type: "varchar",
    length: 50,
    default: JobType.FULL_TIME,
  })
  jobType!: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  location!: string | null;

  @Column({
    type: "uuid",
    name: "organization_id",
  })
  organizationId!: string;

  @ManyToOne(() => Organization, { onDelete: "CASCADE" })
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  @OneToMany(() => JobApplication, (application) => application.job)
  applications!: JobApplication[];

  @CreateDateColumn({
    type: "timestamptz",
    name: "created_at",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: "timestamptz",
    name: "updated_at",
  })
  updatedAt!: Date;
}
