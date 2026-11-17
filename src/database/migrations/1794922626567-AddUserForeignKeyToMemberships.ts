import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class AddUserForeignKeyToMemberships1794922626567 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createForeignKey("organization_memberships", 
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE"
            })
        );
    }                
        

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("organization_memberships");
        const foreignKey = table!.foreignKeys.find(fk => fk.columnNames.indexOf("userId") !== -1);
        await queryRunner.dropForeignKey("organization_memberships", foreignKey!);
    }

}
