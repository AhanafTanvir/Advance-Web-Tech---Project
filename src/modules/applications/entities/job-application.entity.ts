import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Job } from "../../jobs/entities/job.entity";

export enum ApplicationStatus {
  PENDING = "PENDING",
  REVIEWING = "REVIEWING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

@Entity({ name: "job_applications" })
@Unique(["job", "applicant"])
export class JobApplication {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "uuid",
    name: "job_id",
  })
  jobId!: string;

  @ManyToOne(() => Job, (job) => job.applications, { onDelete: "CASCADE" })
  @JoinColumn({ name: "job_id" })
  job!: Job;

  @Column({
    type: "uuid",
    name: "applicant_id",
  })
  applicantId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "applicant_id" })
  applicant!: User;

  @Column({
    type: "enum",
    enum: ApplicationStatus,
    enumName: "job_applications_status_enum",
    default: ApplicationStatus.PENDING,
  })
  status!: ApplicationStatus;

  @Column({
    type: "varchar",
    length: 500,
    nullable: true,
  })
  resumeUrl?: string;

  @Column({
    type: "text",
    nullable: true,
  })
  coverLetter?: string;

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
