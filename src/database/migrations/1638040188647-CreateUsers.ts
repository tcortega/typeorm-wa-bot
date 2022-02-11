import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateUsers1638040188647 implements MigrationInterface {
    name = 'CreateUsers1638040188647'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "whatsapp_id" character varying NOT NULL, "valorant_data" character varying NOT NULL, CONSTRAINT "UQ_21590b687d0b09416b00398d20e" UNIQUE ("whatsapp_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
