-- Create migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    timestamp bigint NOT NULL,
    name character varying NOT NULL
);

-- Ensure uuid-ossp extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_logins table
CREATE TABLE IF NOT EXISTS "user_logins" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "login_date" TIMESTAMP NOT NULL DEFAULT now(),
    "ip_address" character varying(45),
    "user_agent" text,
    "device_type" character varying(100),
    "browser" character varying(100),
    "location" character varying(100),
    "is_successful" boolean NOT NULL DEFAULT true,
    CONSTRAINT "PK_user_logins" PRIMARY KEY ("id")
);

-- Create daily_stats table
CREATE TABLE IF NOT EXISTS "daily_stats" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "date" date NOT NULL,
    "new_users" integer NOT NULL DEFAULT 0,
    "active_users" integer NOT NULL DEFAULT 0,
    "total_logins" integer NOT NULL DEFAULT 0,
    "unique_logins" integer NOT NULL DEFAULT 0,
    "new_posts" integer NOT NULL DEFAULT 0,
    "total_views" integer NOT NULL DEFAULT 0,
    "total_likes" integer NOT NULL DEFAULT 0,
    "total_shares" integer NOT NULL DEFAULT 0,
    "new_comments" integer NOT NULL DEFAULT 0,
    "comment_votes" integer NOT NULL DEFAULT 0,
    "new_reports" integer NOT NULL DEFAULT 0,
    "resolved_reports" integer NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "UQ_daily_stats_date" UNIQUE ("date"),
    CONSTRAINT "PK_daily_stats" PRIMARY KEY ("id")
);

-- Create monthly_stats table
CREATE TABLE IF NOT EXISTS "monthly_stats" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "year" integer NOT NULL,
    "month" integer NOT NULL,
    "new_users" integer NOT NULL DEFAULT 0,
    "active_users" integer NOT NULL DEFAULT 0,
    "total_users" integer NOT NULL DEFAULT 0,
    "verified_users" integer NOT NULL DEFAULT 0,
    "banned_users" integer NOT NULL DEFAULT 0,
    "new_posts" integer NOT NULL DEFAULT 0,
    "total_posts" integer NOT NULL DEFAULT 0,
    "published_posts" integer NOT NULL DEFAULT 0,
    "draft_posts" integer NOT NULL DEFAULT 0,
    "total_views" bigint NOT NULL DEFAULT 0,
    "total_likes" bigint NOT NULL DEFAULT 0,
    "total_comments" bigint NOT NULL DEFAULT 0,
    "total_shares" bigint NOT NULL DEFAULT 0,
    "reported_posts" integer NOT NULL DEFAULT 0,
    "flagged_comments" integer NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_monthly_stats" PRIMARY KEY ("id")
);

-- Create system_metrics table
CREATE TYPE IF NOT EXISTS "system_metrics_metric_type_enum" AS ENUM('performance', 'usage', 'error', 'security');

CREATE TABLE IF NOT EXISTS "system_metrics" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "metric_type" "system_metrics_metric_type_enum" NOT NULL,
    "metric_name" character varying(100) NOT NULL,
    "metric_value" numeric(15,6) NOT NULL,
    "unit" character varying(50),
    "metadata" json,
    "recorded_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_system_metrics" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "IDX_user_logins_user_id" ON "user_logins" ("user_id");
CREATE INDEX IF NOT EXISTS "IDX_user_logins_login_date" ON "user_logins" ("login_date");
CREATE INDEX IF NOT EXISTS "IDX_user_logins_ip_address" ON "user_logins" ("ip_address");
CREATE INDEX IF NOT EXISTS "IDX_daily_stats_date" ON "daily_stats" ("date");
CREATE INDEX IF NOT EXISTS "IDX_monthly_stats_year_month" ON "monthly_stats" ("year", "month");
CREATE INDEX IF NOT EXISTS "IDX_system_metrics_metric_type" ON "system_metrics" ("metric_type");
CREATE INDEX IF NOT EXISTS "IDX_system_metrics_recorded_at" ON "system_metrics" ("recorded_at");

-- Insert migration records
INSERT INTO migrations (timestamp, name) VALUES
(1733580000000, 'CreateAnalyticsEntities1733580000000'),
(1733826267000, 'CreateRefreshTokensTable1733826267000'),
(1737738000000, 'AddUserRoleField1737738000000')
ON CONFLICT DO NOTHING;
