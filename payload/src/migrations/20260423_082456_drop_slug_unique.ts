import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "pages_slug_idx";
    CREATE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
    CREATE UNIQUE INDEX "pages_parent_slug_idx" ON "pages" USING btree ("parent_id", "slug") NULLS NOT DISTINCT;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "pages_parent_slug_idx";
    DROP INDEX IF EXISTS "pages_slug_idx";
    CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  `)
}
