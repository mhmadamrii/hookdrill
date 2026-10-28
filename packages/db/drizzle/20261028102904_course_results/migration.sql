CREATE TABLE "course_results" (
	"user_id" text,
	"course" text,
	"assessment" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"best_correct" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"passed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_results_pkey" PRIMARY KEY("user_id","course","assessment")
);
--> statement-breakpoint
ALTER TABLE "course_results" ADD CONSTRAINT "course_results_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;