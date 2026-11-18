import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Response } from "express";

export interface StandardResponse<T> {
  statusCode: number;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, any>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        // If data is already a paginated response ({ data, total, page, limit })
        // or a simple string/buffer, preserve structure
        if (data && typeof data === "object" && "total" in data && "page" in data) {
          return {
            statusCode: response?.statusCode || 200,
            ...data,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          statusCode: response?.statusCode || 200,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
