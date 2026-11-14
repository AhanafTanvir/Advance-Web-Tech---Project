import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("organizations")
export class Organization {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "text", nullable: true }) //description has no length limit, so we use 'text' type instead of 'varchar'
  description!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  website!: string | null; //website url

  @Column({ type: "varchar", length: 500, nullable: true })
  logo!: string | null; //logo url can be long, so we use 500 length

  @Column({ type: "varchar", length: 100, nullable: true })
  industry!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  location!: string | null;

  @Column({ type: "boolean", default: false })
  isVerified!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
