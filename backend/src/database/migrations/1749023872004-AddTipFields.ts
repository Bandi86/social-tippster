import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTipFields1749023872004 implements MigrationInterface {
    name = 'AddTipFields1749023872004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."posts_tip_category_enum" AS ENUM('single_bet', 'combo_bet', 'system_bet', 'live_bet')`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "tip_category" "public"."posts_tip_category_enum"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "match_name" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "match_date" date`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "match_time" character varying(10)`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "outcome" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "total_odds" numeric(8,2)`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "submission_deadline" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "is_result_set" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "is_valid_tip" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "validation_errors" text`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "shareable_link" text`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "edit_history" json`);
        await queryRunner.query(`ALTER TYPE "public"."posts_type_enum" RENAME TO "posts_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."posts_type_enum" AS ENUM('tip', 'general', 'discussion', 'analysis')`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "type" TYPE "public"."posts_type_enum" USING "type"::"text"::"public"."posts_type_enum"`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "type" SET DEFAULT 'discussion'`);
        await queryRunner.query(`DROP TYPE "public"."posts_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."posts_status_enum" RENAME TO "posts_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."posts_status_enum" AS ENUM('draft', 'published', 'private', 'archived', 'deleted', 'reported')`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "status" TYPE "public"."posts_status_enum" USING "status"::"text"::"public"."posts_status_enum"`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "status" SET DEFAULT 'published'`);
        await queryRunner.query(`DROP TYPE "public"."posts_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "tip_result"`);
        await queryRunner.query(`CREATE TYPE "public"."posts_tip_result_enum" AS ENUM('pending', 'won', 'lost', 'void', 'half_won', 'half_lost')`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "tip_result" "public"."posts_tip_result_enum" DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "tip_result"`);
        await queryRunner.query(`DROP TYPE "public"."posts_tip_result_enum"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "tip_result" boolean`);
        await queryRunner.query(`CREATE TYPE "public"."posts_status_enum_old" AS ENUM('draft', 'published', 'archived')`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "status" TYPE "public"."posts_status_enum_old" USING "status"::"text"::"public"."posts_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "status" SET DEFAULT 'published'`);
        await queryRunner.query(`DROP TYPE "public"."posts_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."posts_status_enum_old" RENAME TO "posts_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."posts_type_enum_old" AS ENUM('tip', 'discussion', 'news', 'analysis')`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "type" TYPE "public"."posts_type_enum_old" USING "type"::"text"::"public"."posts_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "type" SET DEFAULT 'discussion'`);
        await queryRunner.query(`DROP TYPE "public"."posts_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."posts_type_enum_old" RENAME TO "posts_type_enum"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "edit_history"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "shareable_link"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "validation_errors"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "is_valid_tip"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "is_result_set"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "submission_deadline"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "total_odds"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "outcome"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "match_time"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "match_date"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "match_name"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "tip_category"`);
        await queryRunner.query(`DROP TYPE "public"."posts_tip_category_enum"`);
    }

}
