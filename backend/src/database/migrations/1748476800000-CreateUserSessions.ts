import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserSessions1748476800000 implements MigrationInterface {
  name = 'CreateUserSessions1748476800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "session_token" character varying(512),
        "refresh_token_id" uuid,
        "device_type" character varying(100),
        "browser" character varying(100),
        "os" character varying(100),
        "location" character varying(100),
        "country" character varying(100),
        "city" character varying(100),
        "session_start" TIMESTAMP NOT NULL DEFAULT now(),
        "session_end" TIMESTAMP,
        "is_active" boolean NOT NULL DEFAULT true,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_sessions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_sessions_user_id" ON "user_sessions" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_sessions_session_token" ON "user_sessions" ("session_token")`,
    );
    // Add foreign key
    const hasUsersTable = await queryRunner.hasTable('users');
    if (hasUsersTable) {
      await queryRunner.query(`
        ALTER TABLE "user_sessions"
        ADD CONSTRAINT "FK_user_sessions_user_id"
        FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_sessions"`);
  }
}
