# Applications Module & Shared Infrastructure (Member 4)

## Overview
This document specifies the implementation of the **Applications Module** and **Shared Infrastructure** for the Opportunity API (CSC4161 Project), owned by **Member 4**.

---

## 1. Core Entity: `JobApplication`

- **Database Table:** `job_applications`
- **Relations:**
  - `applicant`: `ManyToOne` -> `User` (`users.id`, `onDelete: CASCADE`)
  - `job`: `ManyToOne` -> `Job` (`jobs.id`, `onDelete: CASCADE`)
- **Unique Constraint:**
  ```typescript
  @Unique(['job', 'applicant'])
  ```
  Enforces that a job seeker can only apply once to a given job. Any second application triggers a PostgreSQL unique constraint violation (`23505`), which `AllExceptionsFilter` maps to an HTTP `409 Conflict`.

### Entity Fields
| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary Key |
| `applicantId` | UUID | Foreign key to `User` |
| `jobId` | UUID | Foreign key to `Job` |
| `resumeUrl` | string (optional) | Link to uploaded resume |
| `coverLetter` | text (optional) | Applicant's cover letter |
| `status` | Enum | `PENDING`, `REVIEWING`, `SHORTLISTED`, `REJECTED`, `ACCEPTED` (default: `PENDING`) |
| `createdAt` | timestamptz | Auto-generated timestamp |
| `updatedAt` | timestamptz | Auto-generated timestamp |

---

## 2. API Endpoints (#19 – #24)

| # | Method | Endpoint | Access Role | Success | Handled Errors |
|---|---|---|---|---|---|
| 19 | `POST` | `/api/jobs/:jobId/applications` | `JOB_SEEKER` | 201 Created | 400, 401, 403, 404, 409 (duplicate) |
| 20 | `GET` | `/api/applications/me` | `JOB_SEEKER` | 200 OK | 401 |
| 21 | `GET` | `/api/jobs/:jobId/applications` | Job Owner `EMPLOYER` | 200 OK | 401, 403, 404 |
| 22 | `GET` | `/api/applications/:id` | Applicant or Job Owner | 200 OK | 401, 403, 404 |
| 23 | `PATCH` | `/api/applications/:id/status` | Job Owner `EMPLOYER` | 200 OK | 400, 401, 403, 404 |
| 24 | `DELETE` | `/api/applications/:id` | Applicant (`JOB_SEEKER`) | 200 OK | 401, 403, 404 |

---

## 3. Shared Infrastructure Responsibilities

### Global Exception Filter (`AllExceptionsFilter`)
Located in `src/common/filters/all-exceptions.filter.ts`.
Maps low-level driver and ORM errors into standard HTTP responses:
- **`23505`** (Unique constraint violation) -> `409 Conflict`
- **`22P02`** (Invalid UUID representation) -> `400 Bad Request`
- **`EntityNotFoundError`** (TypeORM record not found) -> `404 Not Found`
- **`HttpException`** -> Standard status and message
- **Standard response shape:**
  ```json
  {
    "statusCode": 409,
    "message": "Duplicate key violation: resource already exists",
    "error": "Conflict",
    "timestamp": "2026-11-18T08:00:00.000Z",
    "path": "/api/jobs/..."
  }
  ```
- **Security:** Hides database stack traces and internal query details from client responses.

### Global Validation Pipe (`main.ts`)
- `whitelist: true`: Strips undeclared body properties.
- `forbidNonWhitelisted: true`: Returns `400 Bad Request` if unexpected properties are sent.
- `transform: true`: Automatically transforms payloads into typed DTO instances.

### Swagger Documentation
- Swagger UI available at `/api/docs` with Bearer Authentication configured via `DocumentBuilder`.

---

## 4. Database Seeder & Test Accounts

Run the seeder with:
```bash
npm run seeder:run:dev
```

Or refresh (truncate and re-seed):
```bash
npm run seeder:refresh:dev
```

### Seed Accounts (Password: `Password123!`)
| Role | Email | Description |
|---|---|---|
| `ADMIN` | `admin@opportunity.com` | System administrator |
| `EMPLOYER` | `employer1@techcorp.com` | TechCorp owner (owns Senior Backend Engineer job) |
| `EMPLOYER` | `employer2@innovate.org` | Innovate Labs owner (owns Frontend React Developer job) |
| `JOB_SEEKER` | `seeker1@gmail.com` | Job seeker (has pending application to TechCorp job) |
| `JOB_SEEKER` | `seeker2@gmail.com` | Fresh job seeker with no initial applications |

---

## 5. Demonstrating Requirement 5: 409 Conflict Demo

1. Log in as `seeker1@gmail.com` via `POST /api/auth/login`.
2. Grab the JWT `accessToken`.
3. Send `POST /api/jobs/{techcorp_job_id}/applications` with header `Authorization: Bearer <accessToken>`.
4. Observe the response:
   ```json
   {
     "statusCode": 409,
     "message": "Duplicate key violation: resource already exists",
     "error": "Conflict",
     "timestamp": "2026-11-18T08:00:00.000Z",
     "path": "/api/jobs/{techcorp_job_id}/applications"
   }
   ```
   This demonstrates the `@Unique(['job', 'applicant'])` constraint combined with `AllExceptionsFilter`.
