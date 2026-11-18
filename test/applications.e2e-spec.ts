import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ApplicationsController } from "../src/modules/applications/applications.controller";
import { ApplicationsService } from "../src/modules/applications/applications.service";
import { ApplicationStatus } from "../src/modules/applications/entities/job-application.entity";
import { JwtGuard } from "../src/common/guard/jwt.guard";
import { RolesGuard } from "../src/common/guard/roles.guard";
import { Role } from "../src/common/enums/role.enum";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require("supertest");

describe("Applications Module (e2e)", () => {
  let app: INestApplication;

  const mockSeeker = {
    id: "11111111-1111-1111-1111-111111111111",
    email: "seeker@test.com",
    roles: [Role.JOB_SEEKER],
  };

  const mockEmployer = {
    id: "22222222-2222-2222-2222-222222222222",
    email: "employer@test.com",
    roles: [Role.EMPLOYER],
  };

  let currentUser = mockSeeker;

  const mockApplication = {
    id: "44444444-4444-4444-4444-444444444441",
    jobId: "33333333-3333-3333-3333-333333333331",
    applicantId: mockSeeker.id,
    status: ApplicationStatus.PENDING,
    resumeUrl: "https://example.com/resume.pdf",
    coverLetter: "Cover letter text",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockApplicationsService = {
    create: jest.fn().mockResolvedValue(mockApplication),
    findMyApplications: jest.fn().mockResolvedValue({
      data: [mockApplication],
      total: 1,
      page: 1,
      limit: 10,
    }),
    findByJob: jest.fn().mockResolvedValue({
      data: [mockApplication],
      total: 1,
      page: 1,
      limit: 10,
    }),
    findOne: jest.fn().mockResolvedValue(mockApplication),
    updateStatus: jest.fn().mockResolvedValue({
      ...mockApplication,
      status: ApplicationStatus.REVIEWING,
    }),
    remove: jest.fn().mockResolvedValue({
      message: "Application withdrawn successfully",
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        {
          provide: ApplicationsService,
          useValue: mockApplicationsService,
        },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = currentUser;
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /jobs/:jobId/applications (Apply for job)", () => {
    currentUser = mockSeeker;
    return request(app.getHttpServer())
      .post("/jobs/33333333-3333-3333-3333-333333333331/applications")
      .send({
        resumeUrl: "https://example.com/resume.pdf",
        coverLetter: "Cover letter text",
      })
      .expect(201)
      .expect((res: any) => {
        expect(res.body.id).toBe(mockApplication.id);
        expect(res.body.status).toBe(ApplicationStatus.PENDING);
      });
  });

  it("GET /applications/me (Get own applications)", () => {
    currentUser = mockSeeker;
    return request(app.getHttpServer())
      .get("/applications/me?page=1&limit=10")
      .expect(200)
      .expect((res: any) => {
        expect(res.body.data).toHaveLength(1);
        expect(res.body.total).toBe(1);
      });
  });

  it("GET /jobs/:jobId/applications (Get applications for job)", () => {
    currentUser = mockEmployer;
    return request(app.getHttpServer())
      .get("/jobs/33333333-3333-3333-3333-333333333331/applications")
      .expect(200)
      .expect((res: any) => {
        expect(res.body.data).toHaveLength(1);
      });
  });

  it("GET /applications/:id (Get single application)", () => {
    return request(app.getHttpServer())
      .get("/applications/44444444-4444-4444-4444-444444444441")
      .expect(200)
      .expect((res: any) => {
        expect(res.body.id).toBe(mockApplication.id);
      });
  });

  it("PATCH /applications/:id/status (Update application status)", () => {
    currentUser = mockEmployer;
    return request(app.getHttpServer())
      .patch("/applications/44444444-4444-4444-4444-444444444441/status")
      .send({ status: ApplicationStatus.REVIEWING })
      .expect(200)
      .expect((res: any) => {
        expect(res.body.status).toBe(ApplicationStatus.REVIEWING);
      });
  });

  it("DELETE /applications/:id (Withdraw application)", () => {
    currentUser = mockSeeker;
    return request(app.getHttpServer())
      .delete("/applications/44444444-4444-4444-4444-444444444441")
      .expect(200)
      .expect((res: any) => {
        expect(res.body.message).toContain("withdrawn successfully");
      });
  });
});
