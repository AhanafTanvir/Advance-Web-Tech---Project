
import {
  Body,
  Controller,
  Get,
  Patch,
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

import { ProfilesService } from "./profiles.service";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

type AuthenticatedRequest = Request & {
  user: AuthUser;
};

@ApiTags("Professional Profiles")
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller("profiles")
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: "Create the authenticated user's professional profile",
  })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateProfileDto,
  ) {
    return this.profilesService.create(req.user.id, dto);
  }

  @Get("me")
  @ApiOperation({
    summary: "Get the authenticated user's professional profile",
  })
  findMyProfile(@Req() req: AuthenticatedRequest) {
    return this.profilesService.findMyProfile(req.user.id);
  }

  @Patch("me")
  @ApiOperation({
    summary: "Update the authenticated user's professional profile",
  })
  updateMyProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profilesService.updateMyProfile(req.user.id, dto);
  }
}
