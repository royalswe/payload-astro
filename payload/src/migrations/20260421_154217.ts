import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_content_carousel_items_card_type" AS ENUM('default', 'minimal');
  CREATE TYPE "public"."enum_pages_blocks_content_carousel_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_content_carousel_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_content_carousel_link_alignment" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_pages_blocks_content_carousel_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_content_carousel_items_card_type" AS ENUM('default', 'minimal');
  CREATE TYPE "public"."enum__pages_v_blocks_content_carousel_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_content_carousel_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_content_carousel_link_alignment" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_content_carousel_link_appearance" AS ENUM('default', 'outline');
  CREATE TABLE "pages_blocks_content_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"card_type" "enum_pages_blocks_content_carousel_items_card_type" DEFAULT 'default',
  	"title" varchar,
  	"text" jsonb,
  	"image_id" integer,
  	"link_type" "enum_pages_blocks_content_carousel_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar
  );
  
  CREATE TABLE "pages_blocks_content_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_content_carousel_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_alignment" "enum_pages_blocks_content_carousel_link_alignment" DEFAULT 'center',
  	"link_appearance" "enum_pages_blocks_content_carousel_link_appearance" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"card_type" "enum__pages_v_blocks_content_carousel_items_card_type" DEFAULT 'default',
  	"title" varchar,
  	"text" jsonb,
  	"image_id" integer,
  	"link_type" "enum__pages_v_blocks_content_carousel_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_content_carousel_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_alignment" "enum__pages_v_blocks_content_carousel_link_alignment" DEFAULT 'center',
  	"link_appearance" "enum__pages_v_blocks_content_carousel_link_appearance" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_content_carousel_items" ADD CONSTRAINT "pages_blocks_content_carousel_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_carousel_items" ADD CONSTRAINT "pages_blocks_content_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_carousel" ADD CONSTRAINT "pages_blocks_content_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_carousel_items" ADD CONSTRAINT "_pages_v_blocks_content_carousel_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_carousel_items" ADD CONSTRAINT "_pages_v_blocks_content_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_carousel" ADD CONSTRAINT "_pages_v_blocks_content_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_content_carousel_items_order_idx" ON "pages_blocks_content_carousel_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_carousel_items_parent_id_idx" ON "pages_blocks_content_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_carousel_items_image_idx" ON "pages_blocks_content_carousel_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_content_carousel_order_idx" ON "pages_blocks_content_carousel" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_carousel_parent_id_idx" ON "pages_blocks_content_carousel" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_carousel_path_idx" ON "pages_blocks_content_carousel" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_carousel_items_order_idx" ON "_pages_v_blocks_content_carousel_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_carousel_items_parent_id_idx" ON "_pages_v_blocks_content_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_carousel_items_image_idx" ON "_pages_v_blocks_content_carousel_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_content_carousel_order_idx" ON "_pages_v_blocks_content_carousel" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_carousel_parent_id_idx" ON "_pages_v_blocks_content_carousel" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_carousel_path_idx" ON "_pages_v_blocks_content_carousel" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_content_carousel_items" CASCADE;
  DROP TABLE "pages_blocks_content_carousel" CASCADE;
  DROP TABLE "_pages_v_blocks_content_carousel_items" CASCADE;
  DROP TABLE "_pages_v_blocks_content_carousel" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_content_carousel_items_card_type";
  DROP TYPE "public"."enum_pages_blocks_content_carousel_items_link_type";
  DROP TYPE "public"."enum_pages_blocks_content_carousel_link_type";
  DROP TYPE "public"."enum_pages_blocks_content_carousel_link_alignment";
  DROP TYPE "public"."enum_pages_blocks_content_carousel_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_content_carousel_items_card_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_carousel_items_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_carousel_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_carousel_link_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_content_carousel_link_appearance";`)
}
