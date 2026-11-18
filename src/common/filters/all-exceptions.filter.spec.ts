import { ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { AllExceptionsFilter } from "./all-exceptions.filter";
import { EntityNotFoundError } from "typeorm";

describe("AllExceptionsFilter", () => {
  let filter: AllExceptionsFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockRequest = {
      originalUrl: "/api/test",
      url: "/api/test",
      method: "POST",
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it("should map Postgres 23505 unique constraint violation to 409 Conflict", () => {
    const error = {
      code: "23505",
      detail: "Key (job_id, applicant_id) already exists.",
    };

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        error: "Conflict",
        message: "A resource with the same unique value already exists.",
        path: "/api/test",
      }),
    );
  });

  it("should map Postgres 22P02 invalid input syntax to 400 Bad Request", () => {
    const error = {
      code: "22P02",
      detail: "invalid input syntax for type uuid",
    };

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        error: "Bad Request",
        message: "Invalid input syntax or malformed identifier.",
        path: "/api/test",
      }),
    );
  });

  it("should map EntityNotFoundError to 404 Not Found", () => {
    const error = new EntityNotFoundError("JobApplication", "123");

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        error: "Not Found",
        path: "/api/test",
      }),
    );
  });

  it("should format standard HttpException without exposing stack traces", () => {
    const exception = new HttpException(
      { message: "Custom validation failure", error: "Bad Request" },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: "Custom validation failure",
        error: "Bad Request",
        path: "/api/test",
      }),
    );
    expect(mockResponse.json).not.toHaveProperty("stack");
  });
});
