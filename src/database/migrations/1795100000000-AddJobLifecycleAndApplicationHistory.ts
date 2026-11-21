import { MigrationInterface, QueryRunner } from "typeorm";

/** Additive upgrade for the user's Jobs/Application workflow. No existing records removed. */
export class AddJobLifecycleAndApplicationHistory1795100000000 implements MigrationInterface {
  name = "AddJobLifecycleAndApplicationHistory1795100000000";

  public async up(q: QueryRunner): Promise<void> {
    const job = await q.getTable("jobs");
    const app = await q.getTable("job_applications");
    if (!job || !app) {
      throw new Error("Jobs and Applications baseline migrations must run first");
    }
    // Explicitly reject the old standalone DB mapping instead of partially migrating it.
    if (!job.findColumnByName("organization_id") || !job.findColumnByName("job_type")
        || !app.findColumnByName("job_id") || !app.findColumnByName("applicant_id")) {
      throw new Error("Database has the standalone camelCase schema. Use a NEW opportunity_team database; do not migrate the older opportunity database directly.");
    }

    await q.query(`ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'OPEN'`);
    await q.query(`ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS deadline timestamptz`);
    await q.query(`ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS withdrawn_at timestamptz`);
    await q.query(`ALTER TYPE public.job_applications_status_enum ADD VALUE IF NOT EXISTS 'WITHDRAWN'`);

    await q.query(`
      CREATE TABLE IF NOT EXISTS public.application_status_history (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id uuid NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
        from_status varchar(20),
        to_status varchar(20) NOT NULL,
        changed_by uuid NOT NULL REFERENCES public.users(id),
        note text,
        created_at timestamptz NOT NULL DEFAULT NOW()
      )
    `);
    await q.query(`CREATE INDEX IF NOT EXISTS idx_app_status_history_application_created
      ON public.application_status_history(application_id, created_at)`);
    await q.query(`CREATE INDEX IF NOT EXISTS idx_jobs_status_type_location
      ON public.jobs(status, job_type, location)`);

    // Snapshot preexisting applications; their earlier transitions are unavailable.
    await q.query(`
      INSERT INTO public.application_status_history
      (application_id, from_status, to_status, changed_by, note, created_at)
      SELECT a.id, NULL, a.status::text, a.applicant_id,
        'Initial snapshot of preexisting application (earlier transitions unavailable)', a.created_at
      FROM public.job_applications a
      WHERE NOT EXISTS (SELECT 1 FROM public.application_status_history h
        WHERE h.application_id = a.id)
    `);
  }

  public async down(_q: QueryRunner): Promise<void> {
    // Deliberately prevent accidental rollback that would erase recorded status history.
    throw new Error("Irreversible history migration: back up and review manually before rollback");
  }
}
