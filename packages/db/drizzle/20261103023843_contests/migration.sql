CREATE TABLE "contest_registrations" (
	"user_id" text,
	"contest" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contest_registrations_pkey" PRIMARY KEY("user_id","contest")
);
--> statement-breakpoint
CREATE TABLE "contest_results" (
	"user_id" text,
	"contest" text,
	"rank" integer NOT NULL,
	"solved" integer NOT NULL,
	"penalty" integer NOT NULL,
	"rating_awarded" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contest_results_pkey" PRIMARY KEY("user_id","contest")
);
--> statement-breakpoint
CREATE TABLE "contest_submissions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "contest_submissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"contest" text NOT NULL,
	"problem" text NOT NULL,
	"accepted" boolean NOT NULL,
	"passed" integer NOT NULL,
	"total" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "contest_submissions_contest_created_at_index" ON "contest_submissions" ("contest","created_at");--> statement-breakpoint
ALTER TABLE "contest_registrations" ADD CONSTRAINT "contest_registrations_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "contest_results" ADD CONSTRAINT "contest_results_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "contest_submissions" ADD CONSTRAINT "contest_submissions_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;