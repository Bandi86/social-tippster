import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnalyticsEntities1733580000000 implements MigrationInterface {
  name = 'CreateAnalyticsEntities1733580000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure uuid-ossp extension exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create user_logins table
    await queryRunner.query(`
      CREATE TABLE "user_logins" (
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
      )
    `);

    // Create daily_stats table
    await queryRunner.query(`
      CREATE TABLE "daily_stats" (
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
      )
    `);

    // Create monthly_stats table
    await queryRunner.query(`
      CREATE TABLE "monthly_stats" (
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
      )
    `);

    // Create system_metrics table
    await queryRunner.query(`
      CREATE TYPE "system_metrics_metric_type_enum" AS ENUM('performance', 'usage', 'error', 'security')
    `);

    await queryRunner.query(`
      CREATE TABLE "system_metrics" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "metric_type" "system_metrics_metric_type_enum" NOT NULL,
        "metric_name" character varying(100) NOT NULL,
        "metric_value" numeric(15,6) NOT NULL,
        "unit" character varying(50),
        "metadata" json,
        "recorded_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_system_metrics" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_user_logins_user_id" ON "user_logins" ("user_id")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_user_logins_login_date" ON "user_logins" ("login_date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_logins_ip_address" ON "user_logins" ("ip_address")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_daily_stats_date" ON "daily_stats" ("date")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_monthly_stats_year_month" ON "monthly_stats" ("year", "month")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_system_metrics_metric_type" ON "system_metrics" ("metric_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_system_metrics_recorded_at" ON "system_metrics" ("recorded_at")`,
    );

    // Add foreign key constraints - check if users table exists first
    const hasUsersTable = await queryRunner.hasTable('users');
    if (hasUsersTable) {
      await queryRunner.query(`
        ALTER TABLE "user_logins"
        ADD CONSTRAINT "FK_user_logins_user_id"
        FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint if it exists
    const hasConstraint: unknown = await queryRunner.query(`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE table_name = 'user_logins' AND constraint_name = 'FK_user_logins_user_id'
    `);

    // Type guard function to check if an object has a constraint_name property
    const hasConstraintName = (obj: unknown): obj is { constraint_name: string } =>
      typeof obj === 'object' && obj !== null && 'constraint_name' in obj;

    // Safe check with proper type guards
    if (
      Array.isArray(hasConstraint) &&
      hasConstraint.length > 0 &&
      hasConstraintName(hasConstraint[0])
    ) {
      await queryRunner.query(`ALTER TABLE "user_logins" DROP CONSTRAINT "FK_user_logins_user_id"`);
    }

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_system_metrics_recorded_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_system_metrics_metric_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_monthly_stats_year_month"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_daily_stats_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_logins_ip_address"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_logins_login_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_logins_user_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "system_metrics"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "system_metrics_metric_type_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "monthly_stats"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "daily_stats"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_logins"`);
  }
}
