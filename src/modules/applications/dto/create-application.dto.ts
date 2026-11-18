import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateApplicationDto {
  @ApiPropertyOptional({
    description: "URL link to the applicant's resume or portfolio",
    example: "https://example.com/resumes/john-doe.pdf",
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  resumeUrl?: string;

  @ApiPropertyOptional({
    description: "Cover letter text introducing the applicant and their qualifications",
    example: "I am writing to express my strong interest in the Senior NestJS Developer role at TechCorp...",
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  coverLetter?: string;
}
