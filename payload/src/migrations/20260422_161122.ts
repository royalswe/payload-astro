import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_flexible_content_items_size" ADD VALUE 'oneFourth' BEFORE 'oneThird';
  ALTER TYPE "public"."enum__pages_v_blocks_flexible_content_items_size" ADD VALUE 'oneFourth' BEFORE 'oneThird';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_flexible_content_items" ALTER COLUMN "size" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_flexible_content_items" ALTER COLUMN "size" SET DEFAULT 'oneThird'::text;
  DROP TYPE "public"."enum_pages_blocks_flexible_content_items_size";
  CREATE TYPE "public"."enum_pages_blocks_flexible_content_items_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  ALTER TABLE "pages_blocks_flexible_content_items" ALTER COLUMN "size" SET DEFAULT 'oneThird'::"public"."enum_pages_blocks_flexible_content_items_size";
  ALTER TABLE "pages_blocks_flexible_content_items" ALTER COLUMN "size" SET DATA TYPE "public"."enum_pages_blocks_flexible_content_items_size" USING "size"::"public"."enum_pages_blocks_flexible_content_items_size";
  ALTER TABLE "_pages_v_blocks_flexible_content_items" ALTER COLUMN "size" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_flexible_content_items" ALTER COLUMN "size" SET DEFAULT 'oneThird'::text;
  DROP TYPE "public"."enum__pages_v_blocks_flexible_content_items_size";
  CREATE TYPE "public"."enum__pages_v_blocks_flexible_content_items_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  ALTER TABLE "_pages_v_blocks_flexible_content_items" ALTER COLUMN "size" SET DEFAULT 'oneThird'::"public"."enum__pages_v_blocks_flexible_content_items_size";
  ALTER TABLE "_pages_v_blocks_flexible_content_items" ALTER COLUMN "size" SET DATA TYPE "public"."enum__pages_v_blocks_flexible_content_items_size" USING "size"::"public"."enum__pages_v_blocks_flexible_content_items_size";`)
}
