# Opportunity Platform API

CSC4161 Advanced Web Technology Project built with **NestJS**, **TypeORM**, **PostgreSQL**, **JWT Authentication with RBAC**, and **Swagger OpenAPI**.

---

## Features & Team Work Split

The project satisfies all five core requirements:
1. **CRUD Endpoints:** Full resources for Users, Organizations, Jobs, and Job Applications.
2. **Database with Transaction:** Managed organization creation with atomic rollback demo.
3. **JWT Authentication & Roles:** Role-based access control with `ADMIN`, `EMPLOYER`, and `JOB_SEEKER` roles.
4. **DTO Validation:** Strict class-validator pipelines and custom UUID parameter validation pipes.
5. **HTTP Exception Handling:** Centralized `AllExceptionsFilter` mapping database constraint errors (`23505` -> 409, `22P02` -> 400, `EntityNotFoundError` -> 404).

### Module Responsibilities
- **Member 1 (Auth & Users):** Authentication, registration, login JWT strategy, and user management (#1 to #7).
- **Member 2 (Organizations):** Organization CRUD, membership relations, and transaction management (#8 to #13).
- **Member 3 (Jobs):** Job creation, listing, filtering, search, and job management (#14 to #18).
- **Member 4 (Applications & Infrastructure):** Applications module (#19 to #24), global `AllExceptionsFilter`, global `ValidationPipe`, Swagger configuration, database seeder, and Postman collections.

---

## Applications Module Endpoints (Member 4)

| # | Method | Endpoint | Role Access | Description | Handled HTTP Codes |
|---|---|---|---|---|---|
| 19 | `POST` | `/api/jobs/:jobId/applications` | `JOB_SEEKER` | Submit job application | 201, 400, 401, 403, 404, 409 |
| 20 | `GET` | `/api/applications/me` | `JOB_SEEKER` | Get current user's applications | 200, 401, 403 |
| 21 | `GET` | `/api/jobs/:jobId/applications` | `EMPLOYER` (Owner) | Get applications for owned job | 200, 401, 403, 404 |
| 22 | `GET` | `/api/applications/:id` | Applicant / Job Owner | Get single application details | 200, 401, 403, 404 |
| 23 | `PATCH` | `/api/applications/:id/status` | `EMPLOYER` (Owner) | Update application status | 200, 400, 401, 403, 404 |
| 24 | `DELETE` | `/api/applications/:id` | Applicant (`JOB_SEEKER`) | Withdraw job application | 200, 401, 403, 404 |

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- pnpm or npm
- Docker & Docker Compose (or local PostgreSQL 16)

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```

Ensure database credentials match your docker environment:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=123456
DB_NAME=opportunity
JWT_BEARER_SECRET=super-secret-jwt-key-for-development
```

### 3. Start Database Containers
```bash
docker-compose up -d
```

### 4. Run Migrations & Seed Data
```bash
# Run database migrations
npm run migration:run

# Populate seed users, organizations, jobs, and applications
npm run seeder:run:dev

# Or refresh database (clean & re-seed)
npm run seeder:refresh:dev
```

### 5. Start the Application
```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### 6. Interactive API Documentation
Open Swagger UI at:
```
http://localhost:3000/api/docs
```

---

## Seed Accounts (Password: `Password123!`)

| Role | Email | Description |
|---|---|---|
| `ADMIN` | `admin@opportunity.com` | Full administrative privileges |
| `EMPLOYER` | `employer1@techcorp.com` | Owner of TechCorp & Senior Backend Engineer job |
| `EMPLOYER` | `employer2@innovate.org` | Owner of Innovate Labs & Frontend Developer job |
| `JOB_SEEKER` | `seeker1@gmail.com` | Has pending application for TechCorp job |
| `JOB_SEEKER` | `seeker2@gmail.com` | Fresh job seeker account |

---

## Requirement 5: Exception Handling & 409 Conflict Demo

1. Obtain a JWT token by logging in as `seeker1@gmail.com`:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "seeker1@gmail.com", "password": "Password123!"}'
   ```
2. Attempt to apply a second time to the TechCorp job (`jobId` seeded in DB):
   ```bash
   curl -X POST http://localhost:3000/api/jobs/{jobId}/applications \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"resumeUrl": "https://example.com/resume.pdf"}'
   ```
3. The database unique constraint `@Unique(['job', 'applicant'])` triggers Postgres error `23505`, caught by `AllExceptionsFilter` which returns:
   ```json
   {
     "statusCode": 409,
     "message": "Duplicate key violation: resource already exists",
     "error": "Conflict",
     "timestamp": "2026-11-18T08:00:00.000Z",
     "path": "/api/jobs/{jobId}/applications"
   }
   ```

---

## Testing

```bash
# Run all unit tests
npm test

# Run end-to-end integration tests
npm run test:e2e
```
