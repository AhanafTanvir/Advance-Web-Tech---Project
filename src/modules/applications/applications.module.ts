import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JobApplication } from "./entities/job-application.entity";
import { Job } from "../jobs/entities/job.entity";
import { OrganizationsModule } from "../organizations/organizations.module";
import { ApplicationsController } from "./applications.controller";
import { ApplicationsService } from "./applications.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([JobApplication, Job]),
    OrganizationsModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
