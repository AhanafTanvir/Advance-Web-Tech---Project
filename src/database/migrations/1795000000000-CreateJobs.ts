import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJobs1795000000000 implements MigrationInterface {
  name = "CreateJobs1795000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "jobs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organizationId" uuid NOT NULL,
        "title" character varying(180) NOT NULL,
        "description" text NOT NULL,
        "jobType" character varying(30) NOT NULL,
        "location" character varying(255) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_jobs_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_jobs_organization" FOREIGN KEY ("organizationId")
          REFERENCES "organizations"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_jobs_created_at" ON "jobs" ("created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_jobs_created_at"`);
    await queryRunner.query(`DROP TABLE "jobs"`);
  }
}
