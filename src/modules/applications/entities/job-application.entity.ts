import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne,
  OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Job } from "../../jobs/entities/job.entity";
import { ApplicationStatusHistory } from "./application-status-history.entity";

export enum ApplicationStatus {
  PENDING = "PENDING",
  REVIEWING = "REVIEWING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
}

@Entity({ name: "job_applications" })
@Unique("UQ_job_applications_job_applicant", ["jobId", "applicantId"])
export class JobApplication {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "job_id" })
  jobId!: string;

  @ManyToOne(() => Job, (job) => job.applications, { onDelete: "CASCADE" })
  @JoinColumn({ name: "job_id" })
  job!: Job;

  @Column({ type: "uuid", name: "applicant_id" })
  applicantId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "applicant_id" })
  applicant!: User;

  // Reuse the team's existing Postgres enum, extended by a new migration.
  @Column({ type: "enum", enum: ApplicationStatus,
    enumName: "job_applications_status_enum", default: ApplicationStatus.PENDING })
  status!: ApplicationStatus;

  @Column({ type: "varchar", length: 500, name: "resume_url", nullable: true })
  resumeUrl!: string | null;

  @Column({ type: "text", name: "cover_letter", nullable: true })
  coverLetter!: string | null;

  @Column({ type: "timestamptz", name: "withdrawn_at", nullable: true })
  withdrawnAt!: Date | null;

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => ApplicationStatusHistory, (h) => h.application)
  statusHistory!: ApplicationStatusHistory[];
}
