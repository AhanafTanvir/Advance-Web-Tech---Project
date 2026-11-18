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
  INTERNSHIP = "INTERNSHIP",
  TEMPORARY = "TEMPORARY",
  REMOTE = "REMOTE",
}

@Entity("jobs")
export class Job {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "organization_id" })
  organizationId!: string;

  @ManyToOne(() => Organization, { onDelete: "CASCADE" })
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  @Column({ type: "varchar", length: 180 })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "varchar", length: 50, name: "job_type", default: JobType.FULL_TIME })
  jobType!: JobType;

  @Column({ type: "varchar", length: 255, nullable: true })
  location!: string | null;

  @OneToMany(() => JobApplication, (application) => application.job)
  applications!: JobApplication[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
