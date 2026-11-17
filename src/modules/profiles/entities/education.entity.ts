
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

@Entity({ name: "educations" })
@Index("IDX_educations_profile_id", ["profile"])
export class Education {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => ProfessionalProfile, (profile) => profile.educations, {
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
  institution!: string;

  @Column({
    type: "varchar",
    length: 150,
  })
  degree!: string;

  @Column({
    name: "field_of_study",
    type: "varchar",
    length: 150,
    nullable: true,
  })
  fieldOfStudy!: string | null;

  @Column({
    name: "start_date",
    type: "date",
    nullable: true,
  })
  startDate!: string | null;

  @Column({
    name: "end_date",
    type: "date",
    nullable: true,
  })
  endDate!: string | null;

  @Column({
    type: "varchar",
    length: 50,
    nullable: true,
  })
  grade!: string | null;

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
