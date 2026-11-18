import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { ApplicationsService } from "./applications.service";
import {
  ApplicationStatus,
  JobApplication,
} from "./entities/job-application.entity";
import { Job } from "../jobs/entities/job.entity";
import { OrganizationsService } from "../organizations/organizations.service";
import { Role } from "@/common/enums/role.enum";

describe("ApplicationsService", () => {
  let service: ApplicationsService;
  let applicationRepo: any;
  let jobRepo: any;
  let organizationsService: any;

  beforeEach(async () => {
    applicationRepo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: "app-uuid", ...entity })),
      remove: jest.fn((entity) => Promise.resolve(entity)),
    };

    jobRepo = {
      findOne: jest.fn(),
    };

    organizationsService = {
      isOrgOwner: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getRepositoryToken(JobApplication),
          useValue: applicationRepo,
        },
        {
          provide: getRepositoryToken(Job),
          useValue: jobRepo,
        },
        {
          provide: OrganizationsService,
          useValue: organizationsService,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  describe("create", () => {
    it("should throw 404 NotFoundException if job does not exist", async () => {
      jobRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create(
          "job-1",
          { coverLetter: "hello" },
          { id: "user-1", roles: [Role.JOB_SEEKER] },
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw 409 ConflictException if user already applied to this job", async () => {
      jobRepo.findOne.mockResolvedValue({ id: "job-1" });
      applicationRepo.findOne.mockResolvedValue({ id: "app-1", jobId: "job-1", applicantId: "user-1" });

      await expect(
        service.create(
          "job-1",
          { coverLetter: "hello" },
          { id: "user-1", roles: [Role.JOB_SEEKER] },
        ),
      ).rejects.toThrow(ConflictException);
    });

    it("should create application successfully with PENDING status", async () => {
      jobRepo.findOne.mockResolvedValue({ id: "job-1" });
      applicationRepo.findOne.mockResolvedValue(null);

      const result = await service.create(
        "job-1",
        { coverLetter: "hello", resumeUrl: "https://resume.com" },
        { id: "user-1", roles: [Role.JOB_SEEKER] },
      );

      expect(result).toHaveProperty("id", "app-uuid");
      expect(result.status).toBe(ApplicationStatus.PENDING);
      expect(applicationRepo.save).toHaveBeenCalled();
    });
  });

  describe("findByJob", () => {
    it("should throw 404 NotFoundException if job does not exist", async () => {
      jobRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findByJob("job-1", "user-1", { page: 1, limit: 10 }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw 403 ForbiddenException if employer is not the job owner", async () => {
      jobRepo.findOne.mockResolvedValue({ id: "job-1", organizationId: "org-1" });
      organizationsService.isOrgOwner.mockResolvedValue(false);

      await expect(
        service.findByJob("job-1", "user-1", { page: 1, limit: 10 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should return paginated applications if user is owner employer", async () => {
      jobRepo.findOne.mockResolvedValue({ id: "job-1", organizationId: "org-1" });
      organizationsService.isOrgOwner.mockResolvedValue(true);
      applicationRepo.findAndCount.mockResolvedValue([[{ id: "app-1" }], 1]);

      const result = await service.findByJob("job-1", "user-1", { page: 1, limit: 10 });
      expect(result).toEqual({
        data: [{ id: "app-1" }],
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  describe("findOne", () => {
    it("should throw 404 NotFoundException if application does not exist", async () => {
      applicationRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findOne("app-1", { id: "user-1", roles: [Role.JOB_SEEKER] }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should allow applicant to view their own application", async () => {
      applicationRepo.findOne.mockResolvedValue({
        id: "app-1",
        applicantId: "user-1",
        job: { organizationId: "org-1" },
      });

      const result = await service.findOne("app-1", { id: "user-1", roles: [Role.JOB_SEEKER] });
      expect(result.id).toBe("app-1");
    });

    it("should throw 403 ForbiddenException for unauthorized viewer", async () => {
      applicationRepo.findOne.mockResolvedValue({
        id: "app-1",
        applicantId: "user-1",
        job: { organizationId: "org-1" },
      });
      organizationsService.isOrgOwner.mockResolvedValue(false);

      await expect(
        service.findOne("app-1", { id: "other-user", roles: [Role.JOB_SEEKER] }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("updateStatus", () => {
    it("should throw 403 ForbiddenException if not the organization owner", async () => {
      applicationRepo.findOne.mockResolvedValue({
        id: "app-1",
        job: { organizationId: "org-1" },
      });
      organizationsService.isOrgOwner.mockResolvedValue(false);

      await expect(
        service.updateStatus(
          "app-1",
          { status: ApplicationStatus.ACCEPTED },
          { id: "user-2", roles: [Role.EMPLOYER] },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should update status if job owner", async () => {
      const mockApp = {
        id: "app-1",
        status: ApplicationStatus.PENDING,
        job: { organizationId: "org-1" },
      };
      applicationRepo.findOne.mockResolvedValue(mockApp);
      organizationsService.isOrgOwner.mockResolvedValue(true);
      applicationRepo.save.mockResolvedValue({ ...mockApp, status: ApplicationStatus.ACCEPTED });

      const result = await service.updateStatus(
        "app-1",
        { status: ApplicationStatus.ACCEPTED },
        { id: "employer-1", roles: [Role.EMPLOYER] },
      );

      expect(result.status).toBe(ApplicationStatus.ACCEPTED);
    });
  });

  describe("remove", () => {
    it("should throw 403 ForbiddenException if user is not the applicant or admin", async () => {
      applicationRepo.findOne.mockResolvedValue({
        id: "app-1",
        applicantId: "user-1",
      });

      await expect(
        service.remove("app-1", { id: "other-user", roles: [Role.JOB_SEEKER] }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should allow applicant to withdraw their application", async () => {
      const mockApp = { id: "app-1", applicantId: "user-1" };
      applicationRepo.findOne.mockResolvedValue(mockApp);

      const result = await service.remove("app-1", { id: "user-1", roles: [Role.JOB_SEEKER] });
      expect(result).toEqual({ message: "Application withdrawn successfully" });
      expect(applicationRepo.remove).toHaveBeenCalledWith(mockApp);
    });
  });
});
