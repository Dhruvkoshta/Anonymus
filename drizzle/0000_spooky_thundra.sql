CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text,
	"createdAt" timestamp DEFAULT now(),
	"userId" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(256),
	"email" varchar(256),
	"password" text,
	"verified" boolean DEFAULT false,
	"verifyCode" text,
	"verifyCodeExpiry" timestamp,
	"isAcceptingMessages" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;