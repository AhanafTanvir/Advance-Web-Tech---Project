import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

type DatabaseDriverError = {
  code?: string;
};

type ExceptionWithDriverError = Error & {
  driverError?: DatabaseDriverError;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = "Internal server error";
    let error = "Internal Server Error";

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

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

      error = HttpStatus[statusCode] ?? "Http Error";
    } else {
      const driverError = (exception as ExceptionWithDriverError | null)?.driverError;
      const databaseErrorCode = driverError?.code;

      // PostgreSQL unique constraint violation.
      if (databaseErrorCode === "23505") {
        statusCode = HttpStatus.CONFLICT;
        message = "A resource with the same unique value already exists.";
        error = "Conflict";
      } else if (databaseErrorCode === "23503") {
        statusCode = HttpStatus.CONFLICT;
        message = "This operation conflicts with an existing related record.";
        error = "Conflict";
      } else if (
        databaseErrorCode === "23502" ||
        databaseErrorCode === "23514" ||
        databaseErrorCode === "22P02"
      ) {
        statusCode = HttpStatus.BAD_REQUEST;
        message = "The supplied data is invalid.";
        error = "Bad Request";
      }

      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    // Never expose database details, SQL statements, or stack traces to clients.
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
      method: request.method,
    });
  }
}
