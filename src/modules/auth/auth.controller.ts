
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";

import { AuthUser } from "@/common/interfaces/auth-user.interface";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { RolesGuard } from "@/common/guard/roles.guard";

import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

type AuthenticatedRequest = Request & {
  user: AuthUser;
};

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @ApiOperation({ summary: "Authenticate a user" })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get("me")
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get the currently authenticated user's profile",
  })
  getProfile(@Req() req: AuthenticatedRequest) {
    return {
      message: "Authenticated user retrieved successfully",
      user: {
        id: req.user.id,
        email: req.user.email,
        roles: req.user.roles,
      },
    };
  }


  @Get("admin-check")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Test access restricted to administrators",
  })
  adminCheck() {
    return {
      message: "Admin authorization successful",
      requiredRole: Role.ADMIN,
    };
  }

  @Get("employer-check")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("EMPLOYER" as Role)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Test access restricted to employers",
  })
  employerCheck() {
    return {
      message: "Employer authorization successful",
      requiredRole: "EMPLOYER" as Role,
    };
  }

  @Get("job-seeker-check")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles("JOB_SEEKER" as Role)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Test access restricted to job seekers",
  })
  jobSeekerCheck() {
    return {
      message: "Job seeker authorization successful",
      requiredRole: "JOB_SEEKER" as Role,
    };
  }

}
