import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableUnique } from "typeorm";

export class CreateJobsAndApplications1794930000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

    // 1. Create jobs table
    await queryRunner.createTable(
      new Table({
        name: "jobs",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "title",
            type: "varchar",
            length: "150",
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
            isNullable: false,
          },
          {
            name: "job_type",
            type: "varchar",
            length: "50",
            default: "'FULL_TIME'",
            isNullable: false,
          },
          {
            name: "location",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "organization_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp with time zone",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp with time zone",
            default: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["organization_id"],
            referencedTableName: "organizations",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
        ],
      }),
    );

    // 2. Create job application status enum
    await queryRunner.query(
      `CREATE TYPE "public"."job_applications_status_enum" AS ENUM('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED')`,
    );

    // 3. Create job_applications table
    await queryRunner.createTable(
      new Table({
        name: "job_applications",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "job_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "applicant_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "status",
            type: "enum",
            enum: ["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"],
            default: "'PENDING'",
            isNullable: false,
          },
          {
            name: "resume_url",
            type: "varchar",
            length: "500",
            isNullable: true,
          },
          {
            name: "cover_letter",
            type: "text",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp with time zone",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp with time zone",
            default: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["job_id"],
            referencedTableName: "jobs",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
          new TableForeignKey({
            columnNames: ["applicant_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
        ],
        uniques: [
          new TableUnique({
            name: "UQ_job_applications_job_applicant",
            columnNames: ["job_id", "applicant_id"],
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("job_applications");
    await queryRunner.query('DROP TYPE IF EXISTS "public"."job_applications_status_enum"');
    await queryRunner.dropTable("jobs");
  }
}
