import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Historical duplicate creation was conflicting with
 * 1794930000000-CreateJobsAndApplications.ts.
 * The earlier baseline now owns table creation.
 * Preserve this migration's name and timestamp for compatibility with existing
 * migration records; do not drop a shared table from down().
 */
export class CreateJobs1795000000000 implements MigrationInterface {
  name = "CreateJobs1795000000000";
  public async up(_q: QueryRunner): Promise<void> {}
  public async down(_q: QueryRunner): Promise<void> {}
}
