import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateUsersTable1637359759872 implements MigrationInterface {
    name = 'CreateUsersTable1637359759872'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" varchar PRIMARY KEY NOT NULL, "whatsapp_id" varchar NOT NULL, "valorant_data" varchar NOT NULL)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
