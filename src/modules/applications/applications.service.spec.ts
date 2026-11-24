import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Role } from "../../common/enums/role.enum";
import { OrganizationsService } from "../organizations/organizations.service";
import { Job, JobStatus } from "../jobs/entities/job.entity";
import { ApplicationsService } from "./applications.service";
import { JobApplication, ApplicationStatus } from "./entities/job-application.entity";

const seeker = { id: "seeker-id", roles: [Role.JOB_SEEKER] };
const employer = { id: "employer-id", roles: [Role.EMPLOYER] };

// Repository and transaction doubles let us verify business logic without changing a DB.
describe("ApplicationsService integration behavior", () => {
  let service: ApplicationsService;
  let jobRepo: any;
  let appRepo: any;
  let historyRepo: any;
  let orgs: any;
  let dataSource: any;
  let builder: any;

  beforeEach(async () => {
    builder = {
      where: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };
    appRepo = {
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => ({ id: "application-id", ...data })),
      createQueryBuilder: jest.fn(() => builder),
    };
    jobRepo = { findOneBy: jest.fn() };
    historyRepo = { save: jest.fn(async (row) => row) };
    const manager = {
      getRepository: jest.fn((entity) => entity === JobApplication ? appRepo : entity === Job ? jobRepo : historyRepo),
    };
    dataSource = { transaction: jest.fn((cb) => cb(manager)) };
    orgs = { isOrgOwner: jest.fn().mockResolvedValue(true) };
    const moduleRef = await Test.createTestingModule({ providers: [
      ApplicationsService,
      { provide: getRepositoryToken(JobApplication), useValue: appRepo },
      { provide: getRepositoryToken(Job), useValue: jobRepo },
      { provide: OrganizationsService, useValue: orgs },
      { provide: DataSource, useValue: dataSource },
    ] }).compile();
    service = moduleRef.get(ApplicationsService);
  });

  it("rejects a missing job", async () => {
    jobRepo.findOneBy.mockResolvedValue(null);
    await expect(service.create("missing", { resumeUrl: "https://example.com/cv.pdf", coverLetter: "Interested in this role" }, seeker))
      .rejects.toThrow(NotFoundException);
  });

  it("rejects an application for a closed job", async () => {
    jobRepo.findOneBy.mockResolvedValue({ status: JobStatus.CLOSED });
    await expect(service.create("closed", { resumeUrl: "https://example.com/cv.pdf", coverLetter: "Interested in this role" }, seeker))
      .rejects.toThrow(ConflictException);
  });

  it("prevents duplicate submissions", async () => {
    jobRepo.findOneBy.mockResolvedValue({ id: "job", status: JobStatus.OPEN, deadline: null });
    appRepo.findOneBy.mockResolvedValue({ id: "existing" });
    await expect(service.create("job", { resumeUrl: "https://example.com/cv.pdf", coverLetter: "Interested in this role" }, seeker))
      .rejects.toThrow(ConflictException);
  });

  it("creates the application and an initial status-history record in one transaction", async () => {
    jobRepo.findOneBy.mockResolvedValue({ id: "job", status: JobStatus.OPEN, deadline: null });
    appRepo.findOneBy.mockResolvedValue(null);
    const result = await service.create("job", { resumeUrl: "https://example.com/cv.pdf", coverLetter: "Interested in this role" }, seeker);
    expect(result.status).toBe(ApplicationStatus.PENDING);
    expect(historyRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      fromStatus: null, toStatus: ApplicationStatus.PENDING, changedBy: seeker.id,
    }));
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
  });

  it("checks ownership before employer status update", async () => {
    builder.getOne.mockResolvedValue({ id: "application-id", jobId: "job", status: ApplicationStatus.PENDING });
    jobRepo.findOneBy.mockResolvedValue({ id: "job", organizationId: "org" });
    orgs.isOrgOwner.mockResolvedValue(false);
    await expect(service.updateStatus("application-id", { status: ApplicationStatus.ACCEPTED }, employer))
      .rejects.toThrow(ForbiddenException);
  });

  it("updates status and writes history", async () => {
    builder.getOne.mockResolvedValue({ id: "application-id", jobId: "job", status: ApplicationStatus.PENDING });
    jobRepo.findOneBy.mockResolvedValue({ id: "job", organizationId: "org" });
    const result = await service.updateStatus("application-id", { status: ApplicationStatus.REVIEWING, note: "Interview" }, employer);
    expect(result.status).toBe(ApplicationStatus.REVIEWING);
    expect(historyRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      fromStatus: ApplicationStatus.PENDING, toStatus: ApplicationStatus.REVIEWING, note: "Interview",
    }));
  });

  it("withdraws without deleting the application or its status history", async () => {
    builder.getOne.mockResolvedValue({ id: "application-id", applicantId: seeker.id, status: ApplicationStatus.PENDING });
    const result = await service.remove("application-id", seeker);
    expect(result.status).toBe(ApplicationStatus.WITHDRAWN);
    expect(appRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: ApplicationStatus.WITHDRAWN }));
    expect(historyRepo.save).toHaveBeenCalledWith(expect.objectContaining({ toStatus: ApplicationStatus.WITHDRAWN }));
  });
});
