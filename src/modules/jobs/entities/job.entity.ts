import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
<<<<<<< HEAD
=======
  OneToMany,
>>>>>>> origin/feature/organizations
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Organization } from "../../organizations/entities/organization.entity";
<<<<<<< HEAD
=======
import { JobApplication } from "../../applications/entities/job-application.entity";
>>>>>>> origin/feature/organizations

export enum JobType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
<<<<<<< HEAD
  INTERNSHIP = "INTERNSHIP",
  TEMPORARY = "TEMPORARY",
}

@Entity("jobs")
=======
  REMOTE = "REMOTE",
  INTERNSHIP = "INTERNSHIP",
}

@Entity({ name: "jobs" })
>>>>>>> origin/feature/organizations
export class Job {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

<<<<<<< HEAD
  @Column({ type: "uuid", name: "organizationId" })
  organizationId!: string;

  @ManyToOne(() => Organization, { onDelete: "CASCADE" })
  @JoinColumn({ name: "organizationId" })
  organization!: Organization;

  @Column({ type: "varchar", length: 180 })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "varchar", length: 30, name: "jobType" })
  jobType!: JobType;

  @Column({ type: "varchar", length: 255 })
  location!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
=======
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
>>>>>>> origin/feature/organizations
  updatedAt!: Date;
}
