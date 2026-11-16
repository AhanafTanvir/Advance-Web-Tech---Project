
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsers1794700000000 implements MigrationInterface {
  name = "CreateUsers1794700000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."users_role_enum"
      AS ENUM ('ADMIN', 'EMPLOYER', 'JOB_SEEKER')
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "full_name" character varying(150) NOT NULL,
        "email" character varying(255) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "role" "public"."users_role_enum"
          NOT NULL DEFAULT 'JOB_SEEKER',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE
          NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE
          NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_users_email"
      ON "users" ("email")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "public"."UQ_users_email"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "users"
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."users_role_enum"
    `);
  }
}
