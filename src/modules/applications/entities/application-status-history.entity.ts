import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from "typeorm";
import { ApplicationStatus, JobApplication } from "./job-application.entity";

@Entity("application_status_history")
export class ApplicationStatusHistory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "application_id" })
  applicationId!: string;

  @ManyToOne(() => JobApplication, (a) => a.statusHistory, { onDelete: "CASCADE" })
  @JoinColumn({ name: "application_id" })
  application!: JobApplication;

  @Column({ type: "varchar", length: 20, name: "from_status", nullable: true })
  fromStatus!: ApplicationStatus | null;

  @Column({ type: "varchar", length: 20, name: "to_status" })
  toStatus!: ApplicationStatus;

  @Column({ type: "uuid", name: "changed_by" })
  changedBy!: string;

  @Column({ type: "text", nullable: true })
  note!: string | null;

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date;
}
