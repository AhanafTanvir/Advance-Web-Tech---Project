import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export class CreateOrganizationDto{
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUrl()
    @IsOptional()
    @MaxLength(255)
    website?: string;

    @IsUrl()
    @IsOptional()
    @MaxLength(500)
    logo?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    industry?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    location?: string;
    
}