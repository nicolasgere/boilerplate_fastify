CREATE TABLE IF NOT EXISTS "user_linked_auth" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"auth_uuid" varchar(256) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "uuid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_linked_auth" ADD CONSTRAINT "user_linked_auth_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
