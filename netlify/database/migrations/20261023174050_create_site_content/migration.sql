CREATE TABLE "site_content" (
	"id" text PRIMARY KEY,
	"data" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
