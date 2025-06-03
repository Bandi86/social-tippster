import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSnoozedUntilToNotifications1750001000000 implements MigrationInterface {
  name = 'AddSnoozedUntilToNotifications1750001000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notifications" ADD "snoozed_until" TIMESTAMP NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "snoozed_until"`);
  }
}
