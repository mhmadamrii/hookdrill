CREATE TABLE "design_drafts" (
	"user_id" text,
	"course" text NOT NULL,
	"challenge" text,
	"version" text,
	"answers" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "design_drafts_pkey" PRIMARY KEY("user_id","challenge","version")
);
--> statement-breakpoint
CREATE TABLE "design_evaluations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "design_evaluations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"submission_id" text NOT NULL,
	"attempt" integer NOT NULL,
	"model" text NOT NULL,
	"prompt_version" text NOT NULL,
	"rubric_version" text NOT NULL,
	"outcome" text NOT NULL,
	"raw" text,
	"error" text,
	"duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "design_submissions" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"course" text NOT NULL,
	"challenge" text NOT NULL,
	"version" text NOT NULL,
	"rubric_version" text NOT NULL,
	"answers" jsonb NOT NULL,
	"status" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"locked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"evaluated_at" timestamp with time zone,
	"score" integer,
	"passed" boolean,
	"result" jsonb,
	"error" text,
	CONSTRAINT "design_submissions_user_id_challenge_version_unique" UNIQUE("user_id","challenge","version")
);
--> statement-breakpoint
CREATE INDEX "design_evaluations_submission_id_index" ON "design_evaluations" ("submission_id");--> statement-breakpoint
CREATE INDEX "design_submissions_user_id_evaluated_at_index" ON "design_submissions" ("user_id","evaluated_at");--> statement-breakpoint
ALTER TABLE "design_drafts" ADD CONSTRAINT "design_drafts_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "design_evaluations" ADD CONSTRAINT "design_evaluations_submission_id_design_submissions_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "design_submissions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "design_submissions" ADD CONSTRAINT "design_submissions_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;