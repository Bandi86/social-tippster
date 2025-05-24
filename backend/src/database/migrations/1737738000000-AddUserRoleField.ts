import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRoleField1737738000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add role column to users table with default value 'user'
    await queryRunner.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' NOT NULL;
      UPDATE users SET role = 'user' WHERE role IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove role column if migration is reverted
    await queryRunner.query(`
      ALTER TABLE users DROP COLUMN IF EXISTS role;
    `);
  }
}
