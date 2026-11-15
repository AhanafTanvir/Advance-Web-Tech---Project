import { Module } from '@nestjs/common';
import { OrganizationMembership } from './entities/organization-membership.entity';
import { Organization } from './entities/organization.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

@Module({
    imports: [TypeOrmModule.forFeature([Organization, OrganizationMembership])],
    controllers: [OrganizationsController],
    providers: [OrganizationsService],
    exports: [OrganizationsService]
})
export class OrganizationsModule {}