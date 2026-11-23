import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProjects1795100000000 implements MigrationInterface {
  name = "CreateProjects1795100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "projects_project_type_enum" AS ENUM ('FIXED_PRICE', 'HOURLY')`);
    await queryRunner.query(`CREATE TYPE "projects_status_enum" AS ENUM ('DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED')`);

    await queryRunner.query(`CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "client_id" uuid NOT NULL, "title" character varying(200) NOT NULL, "description" text NOT NULL, "project_type" "projects_project_type_enum" NOT NULL, "budget_min" numeric(12,2), "budget_max" numeric(12,2), "currency" character varying(3) NOT NULL DEFAULT 'BDT', "status" "projects_status_enum" NOT NULL DEFAULT 'DRAFT', "deadline" date, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_projects_id" PRIMARY KEY ("id"), CONSTRAINT "FK_projects_client_id" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT, CONSTRAINT "CHK_projects_budget_min_nonnegative" CHECK ("budget_min" IS NULL OR "budget_min" >= 0), CONSTRAINT "CHK_projects_budget_max_nonnegative" CHECK ("budget_max" IS NULL OR "budget_max" >= 0), CONSTRAINT "CHK_projects_budget_range" CHECK ("budget_min" IS NULL OR "budget_max" IS NULL OR "budget_min" <= "budget_max"))`);

    await queryRunner.query(`CREATE INDEX "IDX_projects_client_id" ON "projects" ("client_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_projects_status" ON "projects" ("status")`);

    await queryRunner.query(`CREATE TABLE "project_skills" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "project_id" uuid NOT NULL, "skill_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_project_skills_id" PRIMARY KEY ("id"), CONSTRAINT "FK_project_skills_project_id" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE, CONSTRAINT "FK_project_skills_skill_id" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT, CONSTRAINT "UQ_project_skills_project_skill" UNIQUE ("project_id", "skill_id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "project_skills"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TYPE "projects_status_enum"`);
    await queryRunner.query(`DROP TYPE "projects_project_type_enum"`);
  }
}