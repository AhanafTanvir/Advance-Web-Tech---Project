import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUrl, MaxLength, MinLength } from "class-validator";

export class CreateApplicationDto {
  @ApiProperty({ example: "https://example.com/resume.pdf" })
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  resumeUrl!: string;

  @ApiProperty({ example: "I have experience with NestJS and PostgreSQL." })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  coverLetter!: string;
}
