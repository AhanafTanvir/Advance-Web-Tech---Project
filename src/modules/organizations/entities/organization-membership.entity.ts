import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Organization } from "./organization.entity";
import { User } from "../../users/entities/user.entity";

export enum MembershipRole {
    OWNER="OWNER",
    MEMBER="MEMBER",
}

@Entity("organization_memberships")
export class OrganizationMembership{
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({type: "uuid", name: "userId"})
    userId!: string;

    @Column({type: "uuid", name: "organizationId"})
    organizationId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @ManyToOne(() => Organization, { onDelete: "CASCADE" })
    @JoinColumn({ name: "organizationId" })
    organization!: Organization;

    @Column({type: "enum", enum: MembershipRole, default: MembershipRole.MEMBER})
    role!: MembershipRole;

    @CreateDateColumn({name: "created_at"})
    createdAt!: Date;


}