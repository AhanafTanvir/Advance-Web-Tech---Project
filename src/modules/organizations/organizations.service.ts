import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Organization } from "./entities/organization.entity";
import { DataSource, Repository } from "typeorm";
import {
  MembershipRole,
  OrganizationMembership,
} from "./entities/organization-membership.entity";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,

    @InjectRepository(OrganizationMembership)
    private readonly membershipRepository: Repository<OrganizationMembership>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createOrgDto: CreateOrganizationDto, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const org = manager.create(Organization, createOrgDto);
      await manager.save(org);

      const membership = manager.create(OrganizationMembership, {
        userId: userId,
        organiztionId: org.id,
        role: MembershipRole.OWNER,
      });
      await manager.save(membership);

      await manager.query(`UPDATE users SET role = 'EMPLOYER' WHERE id = $1`, [
        userId,
      ]);

      return org;
    });
  }

  async findAll(page: number=1, limit: number=10) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.orgRepository.findAndCount({
      skip: skip,
      take: limit,
      order: { createdAt: "DESC" },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const org = await this.orgRepository.findOne({ where: {id} });
    if (!org) {
      throw new NotFoundException(`Organiztion with ID ${id} not found`);
    }
    return org;
  }

  async update(id: string, updateOrgDto: UpdateOrganizationDto) {
    const org = await this.findOne(id);
    Object.assign(org, updateOrgDto);
    return await this.orgRepository.save(org);
  }

  async verify(id: string) {
    const org = await this.findOne(id);
    if (!org.isVerified) {
      org.isVerified = true;
      await this.orgRepository.save(org);
    }

    return org;
  }

  async remove(id: string) {
    const org = await this.findOne(id);
    await this.orgRepository.remove(org);
    return {
      message: `Organization with ID ${id} has been removed successfully`,
    };
  }

  async isOrgOwner(userId: string, orgId: string): Promise<boolean> {
    const membership = await this.membershipRepository.findOne({
      where: {
        userId: userId,
        organizationId: orgId,
        role: MembershipRole.OWNER,
      }
    })
    if(membership===null) {
        return false;
    }
    else{
        return true;
    }
  }
}
