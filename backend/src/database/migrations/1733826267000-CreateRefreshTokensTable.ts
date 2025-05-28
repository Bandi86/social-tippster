import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokensTable1733826267000 implements MigrationInterface {
  name = 'CreateRefreshTokensTable1733826267000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists before creating
    const tableExists = await queryRunner.hasTable('refresh_tokens');
    if (!tableExists) {
      await queryRunner.query(`
        CREATE TABLE "refresh_tokens" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "user_id" uuid NOT NULL,
          "token_hash" character varying(255) NOT NULL,
          "expires_at" TIMESTAMP NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          "used_at" TIMESTAMP,
          "is_revoked" boolean NOT NULL DEFAULT false,
          CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id")
        )
      `);

      // Create indexes
      await queryRunner.query(
        `CREATE UNIQUE INDEX "IDX_refresh_tokens_token_hash" ON "refresh_tokens" ("token_hash")`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_refresh_tokens_expires_at" ON "refresh_tokens" ("expires_at")`,
      );
    }

    // Check if foreign key constraint exists before adding it
    const hasConstraint = await this.checkConstraintExists(
      queryRunner,
      'refresh_tokens',
      'FK_3ddc983c5f7bcf132fd8732c3f4',
    );

    if (!hasConstraint) {
      await queryRunner.query(`
        ALTER TABLE "refresh_tokens"
        ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"
        FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if constraint exists before dropping
    const hasConstraint = await this.checkConstraintExists(
      queryRunner,
      'refresh_tokens',
      'FK_3ddc983c5f7bcf132fd8732c3f4',
    );

    if (hasConstraint) {
      await queryRunner.query(
        'ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"',
      );
    }

    // Check if indexes exist before dropping
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_refresh_tokens_expires_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_refresh_tokens_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_refresh_tokens_token_hash"`);

    // Drop the table if it exists
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
  }

  /**
   * Helper method to check if a constraint exists
   */
  private async checkConstraintExists(
    queryRunner: QueryRunner,
    tableName: string,
    constraintName: string,
  ): Promise<boolean> {
    const result = (await queryRunner.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = '${tableName}'
      AND constraint_name = '${constraintName}'
    `)) as unknown[];

    return Array.isArray(result) && result.length > 0;
  }
}
