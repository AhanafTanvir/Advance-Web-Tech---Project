import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateOrganizations1794836936425 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "organizations",
                columns:[
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "150",
                        isNullable: false
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "website",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name:"logo",
                        type:"varchar",
                        length:"500",
                        isNullable:true
                    },
                    {
                        name: "industry",
                        type: "varchar",
                        length: "100",
                        isNullable: true,
                    },
                    {
                        name:"location",
                        type:"varchar",
                        length:"255",
                        isNullable:true,
                    },
                    {
                        name:"isVerified",
                        type:"boolean",
                        default:false
                    },

                    {
                        name:"created_at",
                        type:"timestamp",
                        default:"CURRENT_TIMESTAMP(6)"
                    },
                    {
                        name:"updated_at",
                        type:"timestamp",
                        default:"CURRENT_TIMESTAMP(6)"
                    },
                ]
            })
        )

        await queryRunner.query(`CREATE TYPE "public"."organization_memberships_role_enum" AS ENUM('OWNER', 'MEMBER')`);
        
        await queryRunner.createTable(
            new Table({
                name: "organization_memberships",
                columns:[
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "userId",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "organizationId",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "role",
                        type: "enum",
                        enum: ["OWNER", "MEMBER"],
                        default: "'MEMBER'",
                    },
                    {
                        name:"created_at",
                        type:"timestamp",
                        default:"CURRENT_TIMESTAMP(6)"
                    },
                ],
                
                foreignKeys:[{
                    columnNames: ["organizationId"],
                    referencedTableName: "organizations",
                    referencedColumnNames: ["id"],
                    onDelete: "CASCADE",
                }]
            })
        )
    }


    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("organization_memberships");
        await queryRunner.query(`DROP TYPE "public"."organization_memberships_role_enum"`);
        await queryRunner.dropTable("organizations");
    }

}
