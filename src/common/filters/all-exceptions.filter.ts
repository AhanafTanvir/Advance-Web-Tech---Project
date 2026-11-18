import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { EntityNotFoundError } from "typeorm";

type DatabaseDriverError = {
  code?: string;
  detail?: string;
};

type ExceptionWithDriverError = Error & {
  code?: string;
  driverError?: DatabaseDriverError;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = "Internal server error";
    let error = "Internal Server Error";

    if (exception instanceof HttpException) {
      const httpException = exception as HttpException;
      statusCode = httpException.getStatus();
      const exceptionResponse = httpException.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (
        exceptionResponse &&
        typeof exceptionResponse === "object" &&
        "message" in exceptionResponse
      ) {
        const responseMessage = (exceptionResponse as { message?: unknown }).message;
        if (
          typeof responseMessage === "string" ||
          (Array.isArray(responseMessage) &&
            responseMessage.every((item) => typeof item === "string"))
        ) {
          message = responseMessage;
        }
      }

      const resError =
        typeof exceptionResponse === "object" &&
        exceptionResponse !== null &&
        "error" in exceptionResponse
          ? (exceptionResponse as { error?: unknown }).error
          : undefined;

      error =
        typeof resError === "string"
          ? resError
          : (HttpStatus[statusCode] ?? "Http Error");
    } else if (
      exception instanceof EntityNotFoundError ||
      (exception instanceof Error && exception.name === "EntityNotFoundError")
    ) {
      statusCode = HttpStatus.NOT_FOUND;
      message = (exception as Error).message || "Requested entity not found";
      error = "Not Found";
    } else {
      const driverError = (exception as ExceptionWithDriverError | null)?.driverError;
      const databaseErrorCode =
        driverError?.code || (exception as ExceptionWithDriverError | null)?.code;

      // PostgreSQL 23505: Unique violation (e.g. unique constraint job + applicant)
      if (databaseErrorCode === "23505") {
        statusCode = HttpStatus.CONFLICT;
        message = "A resource with the same unique value already exists.";
        error = "Conflict";
      } else if (databaseErrorCode === "22P02") {
        // PostgreSQL 22P02: Invalid input syntax (e.g. invalid UUID format)
        statusCode = HttpStatus.BAD_REQUEST;
        message = "Invalid input syntax or malformed identifier.";
        error = "Bad Request";
      } else if (databaseErrorCode === "23503") {
        // PostgreSQL 23503: Foreign key violation
        statusCode = HttpStatus.CONFLICT;
        message = "This operation conflicts with an existing related record.";
        error = "Conflict";
      } else if (
        databaseErrorCode === "23502" ||
        databaseErrorCode === "23514"
      ) {
        // PostgreSQL 23502 (NOT NULL violation) / 23514 (CHECK violation)
        statusCode = HttpStatus.BAD_REQUEST;
        message = "The supplied data is invalid or missing required fields.";
        error = "Bad Request";
      }

      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    // Never expose raw internal database details or stack traces to clients
    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      message = "Internal server error";
      error = "Internal Server Error";
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.originalUrl ?? request.url,
    });
  }
}
