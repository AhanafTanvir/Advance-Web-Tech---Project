import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import dataSourceOptions from "./config/database.config";
import { User } from "./modules/users/entities/user.entity";
import { Organization } from "./modules/organizations/entities/organization.entity";
import {
  MembershipRole,
  OrganizationMembership,
} from "./modules/organizations/entities/organization-membership.entity";
import { Job, JobType } from "./modules/jobs/entities/job.entity";
import {
  ApplicationStatus,
  JobApplication,
} from "./modules/applications/entities/job-application.entity";
import { Role } from "./common/enums/role.enum";

dotenv.config();

async function runSeed() {
  const isRefresh = process.argv.includes("--refresh");

  const seederDataSource = new DataSource({
    ...dataSourceOptions,
    entities: [
      User,
      Organization,
      OrganizationMembership,
      Job,
      JobApplication,
    ],
  });

  console.log("Connecting to the database for seeding...");
  await seederDataSource.initialize();
  console.log("Database connected successfully.\n");

  try {
    if (isRefresh) {
      console.log("Refreshing database: cleaning up existing data...");
      try {
        await seederDataSource.query(
          'TRUNCATE TABLE "job_applications", "jobs", "organization_memberships", "organizations", "users" CASCADE;',
        );
      } catch {
        // Fallback cleanup in reverse dependency order if TRUNCATE CASCADE fails or tables are missing
        await seederDataSource.query('DELETE FROM "job_applications"').catch(() => {});
        await seederDataSource.query('DELETE FROM "jobs"').catch(() => {});
        await seederDataSource.query('DELETE FROM "organization_memberships"').catch(() => {});
        await seederDataSource.query('DELETE FROM "organizations"').catch(() => {});
        await seederDataSource.query('DELETE FROM "users"').catch(() => {});
      }
      console.log("Cleanup completed.\n");
    }

    const userRepo = seederDataSource.getRepository(User);
    const orgRepo = seederDataSource.getRepository(Organization);
    const membershipRepo = seederDataSource.getRepository(OrganizationMembership);
    const jobRepo = seederDataSource.getRepository(Job);
    const applicationRepo = seederDataSource.getRepository(JobApplication);

    const defaultPassword = "Password123!";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // ==========================================
    // 1. Seed Users (1 Admin, 2 Employers, 2 Job Seekers)
    // ==========================================
    console.log("Seeding users...");

    // 1 Admin
    let admin = await userRepo.findOne({ where: { email: "admin@example.com" } });
    if (!admin) {
      admin = userRepo.create({
        fullName: "System Admin",
        email: "admin@example.com",
        passwordHash,
        role: Role.ADMIN,
        isActive: true,
      });
      await userRepo.save(admin);
    }

    // 2 Employers
    let employer1 = await userRepo.findOne({
      where: { email: "employer1@techcorp.com" },
    });
    if (!employer1) {
      employer1 = userRepo.create({
        fullName: "Alice Tech",
        email: "employer1@techcorp.com",
        passwordHash,
        role: Role.EMPLOYER,
        isActive: true,
      });
      await userRepo.save(employer1);
    }

    let employer2 = await userRepo.findOne({
      where: { email: "employer2@innovate.com" },
    });
    if (!employer2) {
      employer2 = userRepo.create({
        fullName: "Bob Innovate",
        email: "employer2@innovate.com",
        passwordHash,
        role: Role.EMPLOYER,
        isActive: true,
      });
      await userRepo.save(employer2);
    }

    // 2 Job Seekers
    let seeker1 = await userRepo.findOne({
      where: { email: "seeker1@example.com" },
    });
    if (!seeker1) {
      seeker1 = userRepo.create({
        fullName: "John Seeker",
        email: "seeker1@example.com",
        passwordHash,
        role: Role.JOB_SEEKER,
        isActive: true,
      });
      await userRepo.save(seeker1);
    }

    let seeker2 = await userRepo.findOne({
      where: { email: "seeker2@example.com" },
    });
    if (!seeker2) {
      seeker2 = userRepo.create({
        fullName: "Jane Seeker",
        email: "seeker2@example.com",
        passwordHash,
        role: Role.JOB_SEEKER,
        isActive: true,
      });
      await userRepo.save(seeker2);
    }

    console.log("Users seeded successfully.");

    // ==========================================
    // 2. Seed Sample Organizations
    // ==========================================
    console.log("Seeding sample organizations...");

    let org1 = await orgRepo.findOne({ where: { name: "TechCorp Solutions" } });
    if (!org1) {
      org1 = orgRepo.create({
        name: "TechCorp Solutions",
        description: "Enterprise cloud software and developer tooling company.",
        website: "https://techcorp.example.com",
        logo: "https://techcorp.example.com/logo.png",
        industry: "Information Technology",
        location: "San Francisco, CA",
        isVerified: true,
      });
      await orgRepo.save(org1);
    }

    let org2 = await orgRepo.findOne({ where: { name: "Innovate Labs" } });
    if (!org2) {
      org2 = orgRepo.create({
        name: "Innovate Labs",
        description: "Next-generation AI and software development studio.",
        website: "https://innovatelabs.example.com",
        logo: "https://innovatelabs.example.com/logo.png",
        industry: "AI & Software",
        location: "New York, NY",
        isVerified: false,
      });
      await orgRepo.save(org2);
    }

    // Organization Memberships (Employer 1 -> Org 1, Employer 2 -> Org 2)
    let membership1 = await membershipRepo.findOne({
      where: { userId: employer1.id, organizationId: org1.id },
    });
    if (!membership1) {
      membership1 = membershipRepo.create({
        userId: employer1.id,
        organizationId: org1.id,
        role: MembershipRole.OWNER,
      });
      await membershipRepo.save(membership1);
    }

    let membership2 = await membershipRepo.findOne({
      where: { userId: employer2.id, organizationId: org2.id },
    });
    if (!membership2) {
      membership2 = membershipRepo.create({
        userId: employer2.id,
        organizationId: org2.id,
        role: MembershipRole.OWNER,
      });
      await membershipRepo.save(membership2);
    }

    console.log("Organizations and memberships seeded successfully.");

    // ==========================================
    // 3. Seed Sample Jobs
    // ==========================================
    console.log("Seeding sample jobs...");

    let job1 = await jobRepo.findOne({
      where: { title: "Senior NestJS Backend Engineer", organizationId: org1.id },
    });
    if (!job1) {
      job1 = jobRepo.create({
        title: "Senior NestJS Backend Engineer",
        description:
          "Seeking a senior backend engineer proficient in NestJS, TypeORM, PostgreSQL, and cloud deployments.",
        jobType: JobType.FULL_TIME,
        location: "Remote",
        organizationId: org1.id,
      });
      await jobRepo.save(job1);
    }

    let job2 = await jobRepo.findOne({
      where: { title: "Cloud DevOps Specialist", organizationId: org1.id },
    });
    if (!job2) {
      job2 = jobRepo.create({
        title: "Cloud DevOps Specialist",
        description:
          "Manage AWS/GCP cloud environments, automated Docker CI/CD pipelines, and Kubernetes infrastructure.",
        jobType: JobType.FULL_TIME,
        location: "Austin, TX",
        organizationId: org1.id,
      });
      await jobRepo.save(job2);
    }

    let job3 = await jobRepo.findOne({
      where: { title: "Frontend React Developer", organizationId: org2.id },
    });
    if (!job3) {
      job3 = jobRepo.create({
        title: "Frontend React Developer",
        description:
          "Build responsive and accessible web applications using React, Next.js, and modern styling libraries.",
        jobType: JobType.CONTRACT,
        location: "Remote",
        organizationId: org2.id,
      });
      await jobRepo.save(job3);
    }

    console.log("Jobs seeded successfully.");

    // ==========================================
    // 4. Seed Sample Job Applications
    // ==========================================
    console.log("Seeding sample job applications...");

    let app1 = await applicationRepo.findOne({
      where: { jobId: job1.id, applicantId: seeker1.id },
    });
    if (!app1) {
      app1 = applicationRepo.create({
        jobId: job1.id,
        applicantId: seeker1.id,
        status: ApplicationStatus.PENDING,
        resumeUrl: "https://example.com/resumes/john-seeker.pdf",
        coverLetter:
          "I have 5 years of backend engineering experience with NestJS and PostgreSQL.",
      });
      await applicationRepo.save(app1);
    }

    let app2 = await applicationRepo.findOne({
      where: { jobId: job3.id, applicantId: seeker2.id },
    });
    if (!app2) {
      app2 = applicationRepo.create({
        jobId: job3.id,
        applicantId: seeker2.id,
        status: ApplicationStatus.REVIEWING,
        resumeUrl: "https://example.com/resumes/jane-seeker.pdf",
        coverLetter:
          "I have built several production frontend dashboards with React and Tailwind CSS.",
      });
      await applicationRepo.save(app2);
    }

    console.log("Applications seeded successfully.\n");

    // ==========================================
    // Seeder Summary
    // ==========================================
    console.log("==================================================");
    console.log("DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("All accounts password: " + defaultPassword);
    console.log("--------------------------------------------------");
    console.log("1. Admin Account:");
    console.log(`   - Email: ${admin.email} (ID: ${admin.id})`);
    console.log("2. Employer Accounts:");
    console.log(`   - Email: ${employer1.email} (Org: ${org1.name})`);
    console.log(`   - Email: ${employer2.email} (Org: ${org2.name})`);
    console.log("3. Job Seeker Accounts:");
    console.log(`   - Email: ${seeker1.email} (ID: ${seeker1.id})`);
    console.log(`   - Email: ${seeker2.email} (ID: ${seeker2.id})`);
    console.log("4. Sample Jobs:");
    console.log(`   - Job 1: "${job1.title}" (ID: ${job1.id})`);
    console.log(`   - Job 2: "${job2.title}" (ID: ${job2.id})`);
    console.log(`   - Job 3: "${job3.title}" (ID: ${job3.id})`);
    console.log("5. Sample Applications:");
    console.log(`   - Application 1: Seeker 1 -> Job 1 (Status: ${app1.status})`);
    console.log(`   - Application 2: Seeker 2 -> Job 3 (Status: ${app2.status})`);
    console.log("==================================================");
  } catch (error) {
    console.error("Seeder failed with error:", error);
    throw error;
  } finally {
    if (seederDataSource.isInitialized) {
      await seederDataSource.destroy();
    }
  }
}

runSeed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
