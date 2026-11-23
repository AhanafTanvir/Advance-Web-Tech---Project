import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RolesGuard } from "../../common/guard/roles.guard";
import { AuthModule } from "../auth/auth.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { Job } from "./entities/job.entity";
import { JobsController } from "./jobs.controller";
import { JobsService } from "./jobs.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Job]),
    AuthModule,
    OrganizationsModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, RolesGuard],
})
export class JobsModule {}
