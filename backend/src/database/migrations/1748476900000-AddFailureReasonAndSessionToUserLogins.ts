import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFailureReasonAndSessionToUserLogins1748476900000 implements MigrationInterface {
  name = 'AddFailureReasonAndSessionToUserLogins1748476900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_logins" ADD COLUMN IF NOT EXISTS "failure_reason" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_logins" ADD COLUMN IF NOT EXISTS "session_start" TIMESTAMP NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_logins" ADD COLUMN IF NOT EXISTS "session_end" TIMESTAMP NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_logins" DROP COLUMN IF EXISTS "failure_reason"`);
    await queryRunner.query(`ALTER TABLE "user_logins" DROP COLUMN IF EXISTS "session_start"`);
    await queryRunner.query(`ALTER TABLE "user_logins" DROP COLUMN IF EXISTS "session_end"`);
  }
}
