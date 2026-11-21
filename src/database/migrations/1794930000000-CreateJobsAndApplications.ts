import { MigrationInterface, QueryRunner } from "typeorm";

/** Team integration baseline. Keeps the TEAM's snake_case Jobs/Application schema. */
export class CreateJobsAndApplications1794930000000 implements MigrationInterface {
  name = "CreateJobsAndApplications1794930000000";

  public async up(q: QueryRunner): Promise<void> {
    await q.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await q.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await q.query(`
      CREATE TABLE IF NOT EXISTS public.jobs (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        title varchar(180) NOT NULL,
        description text NOT NULL,
        job_type varchar(50) NOT NULL DEFAULT 'FULL_TIME',
        location varchar(255),
        organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW()
      )
    `);
    await q.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_applications_status_enum'
         AND typnamespace = 'public'::regnamespace) THEN
        CREATE TYPE public.job_applications_status_enum AS ENUM
          ('PENDING','REVIEWING','ACCEPTED','REJECTED');
      END IF;
    END $$;`);
    await q.query(`
      CREATE TABLE IF NOT EXISTS public.job_applications (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
        applicant_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        status public.job_applications_status_enum NOT NULL DEFAULT 'PENDING',
        resume_url varchar(500),
        cover_letter text,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT "UQ_job_applications_job_applicant" UNIQUE(job_id, applicant_id)
      )
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    // Only roll back on a disposable development database. This removes user data.
    await q.query('DROP TABLE IF EXISTS public.job_applications');
    await q.query('DROP TYPE IF EXISTS public.job_applications_status_enum');
    await q.query('DROP TABLE IF EXISTS public.jobs');
  }
}
