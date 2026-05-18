import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_newsletter_subscribe" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Subscribe to our newsletter',
  	"description" jsonb,
  	"name_placeholder" varchar DEFAULT 'Name',
  	"email_placeholder" varchar DEFAULT 'Email',
  	"consent_label" varchar DEFAULT 'I have read and agree to',
  	"consent_link_text" varchar DEFAULT 'the integrity policy',
  	"consent_link_url" varchar DEFAULT '/integrity-policy',
  	"submit_label" varchar DEFAULT 'Subscribe',
  	"confirmation_title" varchar DEFAULT 'Thank you for subscribing to our newsletter',
  	"confirmation_button_label" varchar DEFAULT 'Subscribe again',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_newsletter_subscribe" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Subscribe to our newsletter',
  	"description" jsonb,
  	"name_placeholder" varchar DEFAULT 'Name',
  	"email_placeholder" varchar DEFAULT 'Email',
  	"consent_label" varchar DEFAULT 'I have read and agree to',
  	"consent_link_text" varchar DEFAULT 'the integrity policy',
  	"consent_link_url" varchar DEFAULT '/integrity-policy',
  	"submit_label" varchar DEFAULT 'Subscribe',
  	"confirmation_title" varchar DEFAULT 'Thank you for subscribing to our newsletter',
  	"confirmation_button_label" varchar DEFAULT 'Subscribe again',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletter_subscribers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"email" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "newsletter_subscribers_id" integer;
  ALTER TABLE "pages_blocks_newsletter_subscribe" ADD CONSTRAINT "pages_blocks_newsletter_subscribe_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_newsletter_subscribe" ADD CONSTRAINT "_pages_v_blocks_newsletter_subscribe_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_newsletter_subscribe_order_idx" ON "pages_blocks_newsletter_subscribe" USING btree ("_order");
  CREATE INDEX "pages_blocks_newsletter_subscribe_parent_id_idx" ON "pages_blocks_newsletter_subscribe" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_newsletter_subscribe_path_idx" ON "pages_blocks_newsletter_subscribe" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_newsletter_subscribe_order_idx" ON "_pages_v_blocks_newsletter_subscribe" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_newsletter_subscribe_parent_id_idx" ON "_pages_v_blocks_newsletter_subscribe" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_newsletter_subscribe_path_idx" ON "_pages_v_blocks_newsletter_subscribe" USING btree ("_path");
  CREATE UNIQUE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers" USING btree ("email");
  CREATE INDEX "newsletter_subscribers_updated_at_idx" ON "newsletter_subscribers" USING btree ("updated_at");
  CREATE INDEX "newsletter_subscribers_created_at_idx" ON "newsletter_subscribers" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_subscribers_fk" FOREIGN KEY ("newsletter_subscribers_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_newsletter_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_subscribers_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_newsletter_subscribe" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_newsletter_subscribe" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "newsletter_subscribers" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_newsletter_subscribe" CASCADE;
  DROP TABLE "_pages_v_blocks_newsletter_subscribe" CASCADE;
  DROP TABLE "newsletter_subscribers" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_newsletter_subscribers_fk";
  
  DROP INDEX "payload_locked_documents_rels_newsletter_subscribers_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "newsletter_subscribers_id";`)
}
