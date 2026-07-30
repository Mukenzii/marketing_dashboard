ALTER TABLE "books" ADD COLUMN "currency" text DEFAULT 'UZS' NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "fx_rate" numeric(18, 8) DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "currency" text DEFAULT 'UZS' NOT NULL;--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "fx_rate" numeric(18, 8) DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE "spend_entries" ADD COLUMN "currency" text DEFAULT 'UZS' NOT NULL;--> statement-breakpoint
ALTER TABLE "spend_entries" ADD COLUMN "fx_rate" numeric(18, 8) DEFAULT '1' NOT NULL;