import { Test, TestingModule } from "@nestjs/testing";
import { ApplicationsController } from "./applications.controller";
import { ApplicationsService } from "./applications.service";
import { Role } from "@/common/enums/role.enum";
import { ApplicationStatus } from "./entities/job-application.entity";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";
import { QueryApplicationDto } from "./dto/query-application.dto";

describe("ApplicationsController", () => {
  let controller: ApplicationsController;
  let service: ApplicationsService;

  const mockUser = {
    id: "user-uuid-1",
    email: "seeker@test.com",
    roles: [Role.JOB_SEEKER],
  };

  const mockEmployer = {
    id: "employer-uuid-1",
    email: "employer@test.com",
    roles: [Role.EMPLOYER],
  };

  const mockApplication = {
    id: "app-uuid-1",
    jobId: "job-uuid-1",
    applicantId: "user-uuid-1",
    status: ApplicationStatus.PENDING,
    resumeUrl: "https://example.com/resume.pdf",
    coverLetter: "I am passionate about this role",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockApplicationsService = {
    create: jest.fn(),
    findMyApplications: jest.fn(),
    findByJob: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        {
          provide: ApplicationsService,
          useValue: mockApplicationsService,
        },
      ],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
    service = module.get<ApplicationsService>(ApplicationsService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should submit a new application", async () => {
      const dto: CreateApplicationDto = {
        resumeUrl: "https://example.com/resume.pdf",
        coverLetter: "Cover letter text",
      };
      mockApplicationsService.create.mockResolvedValue(mockApplication);

      const result = await controller.create("job-uuid-1", dto, { user: mockUser });

      expect(service.create).toHaveBeenCalledWith("job-uuid-1", dto, mockUser);
      expect(result).toEqual(mockApplication);
    });
  });

  describe("findMyApplications", () => {
    it("should return paginated list of user applications", async () => {
      const query: QueryApplicationDto = { page: 1, limit: 10 };
      const expected = { data: [mockApplication], total: 1, page: 1, limit: 10 };
      mockApplicationsService.findMyApplications.mockResolvedValue(expected);

      const result = await controller.findMyApplications(query, { user: mockUser });

      expect(service.findMyApplications).toHaveBeenCalledWith(mockUser.id, query);
      expect(result).toEqual(expected);
    });
  });

  describe("findByJob", () => {
    it("should return applications for a job", async () => {
      const query: QueryApplicationDto = { page: 1, limit: 10 };
      const expected = { data: [mockApplication], total: 1, page: 1, limit: 10 };
      mockApplicationsService.findByJob.mockResolvedValue(expected);

      const result = await controller.findByJob("job-uuid-1", query, { user: mockEmployer });

      expect(service.findByJob).toHaveBeenCalledWith("job-uuid-1", mockEmployer.id, query);
      expect(result).toEqual(expected);
    });
  });

  describe("findOne", () => {
    it("should return a single application", async () => {
      mockApplicationsService.findOne.mockResolvedValue(mockApplication);

      const result = await controller.findOne("app-uuid-1", { user: mockUser });

      expect(service.findOne).toHaveBeenCalledWith("app-uuid-1", mockUser);
      expect(result).toEqual(mockApplication);
    });
  });

  describe("updateStatus", () => {
    it("should update application status", async () => {
      const dto: UpdateApplicationStatusDto = { status: ApplicationStatus.REVIEWING };
      const updated = { ...mockApplication, status: ApplicationStatus.REVIEWING };
      mockApplicationsService.updateStatus.mockResolvedValue(updated);

      const result = await controller.updateStatus("app-uuid-1", dto, { user: mockEmployer });

      expect(service.updateStatus).toHaveBeenCalledWith("app-uuid-1", dto, mockEmployer);
      expect(result.status).toEqual(ApplicationStatus.REVIEWING);
    });
  });

  describe("remove", () => {
    it("should withdraw application", async () => {
      const expected = { message: "Application withdrawn successfully" };
      mockApplicationsService.remove.mockResolvedValue(expected);

      const result = await controller.remove("app-uuid-1", { user: mockUser });

      expect(service.remove).toHaveBeenCalledWith("app-uuid-1", mockUser);
      expect(result).toEqual(expected);
    });
  });
});
