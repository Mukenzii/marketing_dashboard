CREATE TYPE "public"."insights_entity" AS ENUM('ad', 'adset', 'campaign', 'account');--> statement-breakpoint
CREATE TYPE "public"."parse_status" AS ENUM('ok', 'partial', 'failed');--> statement-breakpoint
CREATE TYPE "public"."sync_status" AS ENUM('running', 'success', 'failed');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'normal', 'high');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'review', 'done', 'blocked');--> statement-breakpoint
CREATE TABLE "ad_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meta_account_id" text NOT NULL,
	"name" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"timezone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ad_accounts_meta_account_id_unique" UNIQUE("meta_account_id")
);
--> statement-breakpoint
CREATE TABLE "ad_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meta_adset_id" text NOT NULL,
	"campaign_id" uuid NOT NULL,
	"name" text,
	"optimization_goal" text,
	"bid_strategy" text,
	"bid_amount" numeric(14, 2),
	"daily_budget" numeric(14, 2),
	"lifetime_budget" numeric(14, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ad_sets_meta_adset_id_unique" UNIQUE("meta_adset_id")
);
--> statement-breakpoint
CREATE TABLE "ads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meta_ad_id" text NOT NULL,
	"ad_set_id" uuid NOT NULL,
	"name" text,
	"creative_id" text,
	"thumbnail_url" text,
	"status" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ads_meta_ad_id_unique" UNIQUE("meta_ad_id")
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meta_campaign_id" text NOT NULL,
	"account_id" uuid NOT NULL,
	"name_raw" text NOT NULL,
	"objective" text,
	"status" text,
	"daily_budget" numeric(14, 2),
	"lifetime_budget" numeric(14, 2),
	"start_time" timestamp with time zone,
	"stop_time" timestamp with time zone,
	"book_id" uuid,
	"book_link_confirmed" boolean DEFAULT false NOT NULL,
	"account_code" text,
	"funnel_stage" text,
	"parsed_book_title" text,
	"parsed_objective" text,
	"cost_cap" numeric(14, 2),
	"flight_start" date,
	"flight_end" date,
	"planned_budget" numeric(14, 2),
	"parse_status" "parse_status" DEFAULT 'failed' NOT NULL,
	"parse_errors" jsonb,
	"field_overrides" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campaigns_meta_campaign_id_unique" UNIQUE("meta_campaign_id")
);
--> statement-breakpoint
CREATE TABLE "insights_daily" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" "insights_entity" NOT NULL,
	"entity_id" text NOT NULL,
	"campaign_id" uuid,
	"ad_account_id" uuid NOT NULL,
	"date" date NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"fx_rate" numeric(18, 8) DEFAULT '1' NOT NULL,
	"spend" numeric(18, 4) DEFAULT '0' NOT NULL,
	"impressions" bigint DEFAULT 0 NOT NULL,
	"reach" bigint DEFAULT 0 NOT NULL,
	"frequency" numeric(12, 4) DEFAULT '0' NOT NULL,
	"clicks" bigint DEFAULT 0 NOT NULL,
	"unique_clicks" bigint DEFAULT 0 NOT NULL,
	"inline_link_clicks" bigint DEFAULT 0 NOT NULL,
	"unique_inline_link_clicks" bigint DEFAULT 0 NOT NULL,
	"outbound_clicks" bigint DEFAULT 0 NOT NULL,
	"unique_outbound_clicks" bigint DEFAULT 0 NOT NULL,
	"landing_page_views" bigint DEFAULT 0 NOT NULL,
	"leads" bigint DEFAULT 0 NOT NULL,
	"video_3s_views" bigint DEFAULT 0 NOT NULL,
	"video_thruplay" bigint DEFAULT 0 NOT NULL,
	"video_p25" bigint DEFAULT 0 NOT NULL,
	"video_p50" bigint DEFAULT 0 NOT NULL,
	"video_p75" bigint DEFAULT 0 NOT NULL,
	"video_p100" bigint DEFAULT 0 NOT NULL,
	"purchases" bigint DEFAULT 0 NOT NULL,
	"purchase_value" numeric(18, 4) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metric_thresholds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metric_key" text NOT NULL,
	"objective" text,
	"brand" "brand",
	"warn_below" numeric(18, 6),
	"warn_above" numeric(18, 6),
	"alert_below" numeric(18, 6),
	"alert_above" numeric(18, 6),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"status" "sync_status" DEFAULT 'running' NOT NULL,
	"date_from" date,
	"date_to" date,
	"rows_upserted" integer DEFAULT 0 NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"book_id" uuid,
	"assignee_id" text,
	"created_by" text NOT NULL,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"priority" "task_priority" DEFAULT 'normal' NOT NULL,
	"due_date" date,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "spend_entries" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."spend_type";--> statement-breakpoint
CREATE TYPE "public"."spend_type" AS ENUM('blogger', 'production');--> statement-breakpoint
ALTER TABLE "spend_entries" ALTER COLUMN "type" SET DATA TYPE "public"."spend_type" USING "type"::"public"."spend_type";--> statement-breakpoint
ALTER TABLE "ad_sets" ADD CONSTRAINT "ad_sets_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_ad_set_id_ad_sets_id_fk" FOREIGN KEY ("ad_set_id") REFERENCES "public"."ad_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_account_id_ad_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."ad_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insights_daily" ADD CONSTRAINT "insights_daily_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insights_daily" ADD CONSTRAINT "insights_daily_ad_account_id_ad_accounts_id_fk" FOREIGN KEY ("ad_account_id") REFERENCES "public"."ad_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ad_sets_campaign_id_idx" ON "ad_sets" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "ads_ad_set_id_idx" ON "ads" USING btree ("ad_set_id");--> statement-breakpoint
CREATE INDEX "campaigns_book_id_idx" ON "campaigns" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "campaigns_account_id_idx" ON "campaigns" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "campaigns_parse_status_idx" ON "campaigns" USING btree ("parse_status");--> statement-breakpoint
CREATE UNIQUE INDEX "insights_daily_entity_date_uq" ON "insights_daily" USING btree ("entity_type","entity_id","date");--> statement-breakpoint
CREATE INDEX "insights_daily_campaign_id_idx" ON "insights_daily" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "insights_daily_date_idx" ON "insights_daily" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "metric_thresholds_key_obj_brand_uq" ON "metric_thresholds" USING btree ("metric_key","objective","brand");--> statement-breakpoint
CREATE INDEX "task_comments_task_id_idx" ON "task_comments" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "tasks_assignee_id_idx" ON "tasks" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "tasks_created_by_idx" ON "tasks" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "tasks_book_id_idx" ON "tasks" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");