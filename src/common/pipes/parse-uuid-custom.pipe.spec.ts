import { BadRequestException } from "@nestjs/common";
import { ParseUUIDCustomPipe } from "./parse-uuid-custom.pipe";

describe("ParseUUIDCustomPipe", () => {
  let pipe: ParseUUIDCustomPipe;

  beforeEach(() => {
    pipe = new ParseUUIDCustomPipe();
  });

  it("should be defined", () => {
    expect(pipe).toBeDefined();
  });

  it("should return valid UUID unchanged", () => {
    const validUuid = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
    expect(pipe.transform(validUuid)).toBe(validUuid);
  });

  it("should throw BadRequestException when UUID is invalid", () => {
    expect(() => pipe.transform("not-a-valid-uuid")).toThrow(
      BadRequestException,
    );
  });

  it("should include parameter name in error message", () => {
    const namedPipe = new ParseUUIDCustomPipe("jobId");
    try {
      namedPipe.transform("invalid-uuid");
      fail("Should have thrown BadRequestException");
    } catch (err: any) {
      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.message).toContain("parameter 'jobId' must be a valid UUID");
    }
  });
});
