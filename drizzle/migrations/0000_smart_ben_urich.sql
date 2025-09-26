CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(30) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"otp" text DEFAULT '' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"google_auth" boolean DEFAULT false NOT NULL,
	"joined_rooms" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"last_seen" timestamp with time zone DEFAULT NOW() NOT NULL,
	"friend_list" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"friend_req_send" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"friend_req_recieved" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT NOW() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT NOW() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
