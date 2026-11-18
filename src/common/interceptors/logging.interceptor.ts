import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Request, Response } from "express";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const { method, originalUrl } = req;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const statusCode = res.statusCode;
          const delay = Date.now() - now;
          this.logger.log(`${method} ${originalUrl} ${statusCode} +${delay}ms`);
        },
        error: (err) => {
          const delay = Date.now() - now;
          const statusCode = err?.status || 500;
          this.logger.error(
            `${method} ${originalUrl} ${statusCode} +${delay}ms - ${err?.message || "Internal error"}`,
          );
        },
      }),
    );
  }
}
