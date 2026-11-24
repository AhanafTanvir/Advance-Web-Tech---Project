import { ExecutionContext, CallHandler } from "@nestjs/common";
import { of } from "rxjs";
import { ResponseTransformInterceptor } from "./transform.interceptor";

describe("ResponseTransformInterceptor", () => {
  let interceptor: ResponseTransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new ResponseTransformInterceptor();
  });

  it("should be defined", () => {
    expect(interceptor).toBeDefined();
  });

  it("should transform standard object into structured payload", (done) => {
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of({ id: "123", name: "Test" }),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual({ id: "123", name: "Test" });
      expect(result.timestamp).toBeDefined();
      done();
    });
  });

  it("should preserve pagination structure while adding timestamp", (done) => {
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const paginatedPayload = {
      data: [{ id: "1" }],
      total: 1,
      page: 1,
      limit: 10,
    };

    const mockCallHandler: CallHandler = {
      handle: () => of(paginatedPayload),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual([{ id: "1" }]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.timestamp).toBeDefined();
      done();
    });
  });
});
