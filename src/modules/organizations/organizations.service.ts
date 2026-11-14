import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Organization } from "./entities/organization.entity";
import { DataSource, Repository } from "typeorm";
import { OrganizationMembership } from "./entities/organization-membership.entity";

@Injectable()
export class OrganizationsService {
    constructor
    (@InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,

    @InjectRepository(OrganizationMembership)
    private readonly membershipRepository: Repository<OrganizationMembership>,

    private readonly dataSource: DataSource,
    
    ){}
}