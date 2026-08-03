CREATE TYPE "public"."book_category" AS ENUM('A+', 'A', 'B', 'C', 'new');--> statement-breakpoint
CREATE TABLE "bloggers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"name" text NOT NULL,
	"platform" text,
	"budget_allocated" numeric(14, 2) DEFAULT '0' NOT NULL,
	"spent" numeric(14, 2) DEFAULT '0' NOT NULL,
	"currency" text DEFAULT 'UZS' NOT NULL,
	"note" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "category" "book_category";--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "category_override" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "print_run" integer;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "stock_remaining" integer;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "sales_count" integer;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "marketing_budget" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "target_sales" integer;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "target_budget" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "percent" numeric(7, 2);--> statement-breakpoint
ALTER TABLE "bloggers" ADD CONSTRAINT "bloggers_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bloggers" ADD CONSTRAINT "bloggers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bloggers_book_id_idx" ON "bloggers" USING btree ("book_id");