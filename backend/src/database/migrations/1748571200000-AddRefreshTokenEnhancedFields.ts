import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokenEnhancedFields1748571200000 implements MigrationInterface {
  name = 'AddRefreshTokenEnhancedFields1748571200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the columns don't already exist before adding them
    const hasRevokedAt = await this.columnExists(queryRunner, 'refresh_tokens', 'revoked_at');
    const hasRevokeReason = await this.columnExists(queryRunner, 'refresh_tokens', 'revoke_reason');
    const hasDeviceInfo = await this.columnExists(queryRunner, 'refresh_tokens', 'device_info');
    const hasIpAddress = await this.columnExists(queryRunner, 'refresh_tokens', 'ip_address');

    if (!hasRevokedAt) {
      await queryRunner.query(`
        ALTER TABLE "refresh_tokens"
        ADD COLUMN "revoked_at" TIMESTAMP
      `);
    }

    if (!hasRevokeReason) {
      await queryRunner.query(`
        ALTER TABLE "refresh_tokens"
        ADD COLUMN "revoke_reason" VARCHAR(100)
      `);
    }

    if (!hasDeviceInfo) {
      await queryRunner.query(`
        ALTER TABLE "refresh_tokens"
        ADD COLUMN "device_info" VARCHAR(255)
      `);
    }

    if (!hasIpAddress) {
      await queryRunner.query(`
        ALTER TABLE "refresh_tokens"
        ADD COLUMN "ip_address" INET
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the columns if they exist
    const hasRevokedAt = await this.columnExists(queryRunner, 'refresh_tokens', 'revoked_at');
    const hasRevokeReason = await this.columnExists(queryRunner, 'refresh_tokens', 'revoke_reason');
    const hasDeviceInfo = await this.columnExists(queryRunner, 'refresh_tokens', 'device_info');
    const hasIpAddress = await this.columnExists(queryRunner, 'refresh_tokens', 'ip_address');

    if (hasIpAddress) {
      await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "ip_address"`);
    }

    if (hasDeviceInfo) {
      await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "device_info"`);
    }

    if (hasRevokeReason) {
      await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "revoke_reason"`);
    }

    if (hasRevokedAt) {
      await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "revoked_at"`);
    }
  }

  /**
   * Helper method to check if a column exists
   */
  private async columnExists(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
  ): Promise<boolean> {
    const result = (await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = '${tableName}'
      AND column_name = '${columnName}'
    `)) as unknown[];

    return Array.isArray(result) && result.length > 0;
  }
}
