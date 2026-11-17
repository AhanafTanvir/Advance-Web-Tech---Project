
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProfessionalProfiles1795000000000
  implements MigrationInterface
{
  name = "CreateProfessionalProfiles1795000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create the skill proficiency enum.
    await queryRunner.query(`
      CREATE TYPE "public"."profile_skills_proficiency_enum"
      AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')
    `);

    // 2. Create professional_profiles.
    await queryRunner.query(`
      CREATE TABLE "professional_profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "headline" character varying(200),
        "bio" text,
        "location" character varying(150),
        "resume_url" character varying(500),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_professional_profiles_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_professional_profiles_user_id"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_professional_profiles_user_id"
      ON "professional_profiles" ("user_id")
    `);

    // 3. Create skills.
    await queryRunner.query(`
      CREATE TABLE "skills" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "category" character varying(100),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_skills_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_skills_name"
      ON "skills" ("name")
    `);

    // 4. Create profile_skills.
    await queryRunner.query(`
      CREATE TABLE "profile_skills" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "profile_id" uuid NOT NULL,
        "skill_id" uuid NOT NULL,
        "proficiency" "public"."profile_skills_proficiency_enum" NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_profile_skills_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_profile_skills_profile_id"
          FOREIGN KEY ("profile_id")
          REFERENCES "professional_profiles"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_profile_skills_skill_id"
          FOREIGN KEY ("skill_id")
          REFERENCES "skills"("id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_profile_skills_profile_skill"
      ON "profile_skills" ("profile_id", "skill_id")
    `);

    // 5. Create experiences.
    await queryRunner.query(`
      CREATE TABLE "experiences" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "profile_id" uuid NOT NULL,
        "organization" character varying(150) NOT NULL,
        "job_title" character varying(150) NOT NULL,
        "employment_type" character varying(50),
        "location" character varying(150),
        "start_date" date NOT NULL,
        "end_date" date,
        "is_current" boolean NOT NULL DEFAULT false,
        "description" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_experiences_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_experiences_profile_id"
          FOREIGN KEY ("profile_id")
          REFERENCES "professional_profiles"("id")
          ON DELETE CASCADE,
        CONSTRAINT "CHK_experiences_dates"
          CHECK ("end_date" IS NULL OR "end_date" >= "start_date"),
        CONSTRAINT "CHK_experiences_current"
          CHECK (NOT "is_current" OR "end_date" IS NULL)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_experiences_profile_id"
      ON "experiences" ("profile_id")
    `);

    // 6. Create educations.
    await queryRunner.query(`
      CREATE TABLE "educations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "profile_id" uuid NOT NULL,
        "institution" character varying(200) NOT NULL,
        "degree" character varying(150) NOT NULL,
        "field_of_study" character varying(150),
        "start_date" date,
        "end_date" date,
        "grade" character varying(50),
        "description" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_educations_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_educations_profile_id"
          FOREIGN KEY ("profile_id")
          REFERENCES "professional_profiles"("id")
          ON DELETE CASCADE,
        CONSTRAINT "CHK_educations_dates"
          CHECK (
            "start_date" IS NULL
            OR "end_date" IS NULL
            OR "end_date" >= "start_date"
          )
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_educations_profile_id"
      ON "educations" ("profile_id")
    `);

    // 7. Create portfolio_items.
    await queryRunner.query(`
      CREATE TABLE "portfolio_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "profile_id" uuid NOT NULL,
        "title" character varying(200) NOT NULL,
        "description" text,
        "project_url" character varying(500),
        "repository_url" character varying(500),
        "technologies" text[] NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_portfolio_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_portfolio_items_profile_id"
          FOREIGN KEY ("profile_id")
          REFERENCES "professional_profiles"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_portfolio_items_profile_id"
      ON "portfolio_items" ("profile_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "portfolio_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "educations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "experiences"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "profile_skills"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "skills"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "professional_profiles"`);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."profile_skills_proficiency_enum"
    `);
  }
}
