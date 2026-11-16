
import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
} from "@nestjs/common";

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { Request } from "express";

import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { AuthUser } from "@/common/interfaces/auth-user.interface";

import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateUserRoleDto } from "./dto/update-user-role.dto";
import { UserQueryDto } from "./dto/user-query.dto";

type AuthenticatedRequest = Request & {
  user: AuthUser;
};

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
@UseGuards(JwtGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  // Convert a User entity into a safe public response.
  private toPublicUser(user: User) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Check whether the current user owns the requested resource.
  private ensureOwnerOrAdmin(
    requestedUserId: string,
    currentUser: AuthUser,
  ): void {
    const isAdmin = currentUser.roles.includes(Role.ADMIN);
    const isOwner = currentUser.id === requestedUserId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        "You can only access or update your own account",
      );
    }
  }

  // GET /api/users?page=1&limit=10
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: "Get all users with pagination (Admin only)",
  })
  async findAll(@Query() query: UserQueryDto) {
    const result = await this.usersService.findAll(query);

    return {
      message: "Users retrieved successfully",
      data: result.data.map((user) =>
        this.toPublicUser(user),
      ),
      meta: result.meta,
    };
  }

  // GET /api/users/:id
  @Get(":id")
  @ApiOperation({
    summary: "Get a user by ID (Admin or account owner)",
  })
  async findOne(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    this.ensureOwnerOrAdmin(id, req.user);

    const user = await this.usersService.findByIdOrThrow(id);

    return {
      message: "User retrieved successfully",
      user: this.toPublicUser(user),
    };
  }

  // PATCH /api/users/:id
  @Patch(":id")
  @ApiOperation({
    summary: "Update user profile (Admin or account owner)",
  })
  async updateProfile(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    this.ensureOwnerOrAdmin(id, req.user);

    const user = await this.usersService.updateProfile(
      id,
      dto,
    );

    return {
      message: "User profile updated successfully",
      user: this.toPublicUser(user),
    };
  }

  // PATCH /api/users/:id/role
  @Patch(":id/role")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: "Update user role (Admin only)",
  })
  async updateRole(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    const user = await this.usersService.updateRole(
      id,
      dto,
    );

    return {
      message: "User role updated successfully",
      user: this.toPublicUser(user),
    };
  }

  // DELETE /api/users/:id
  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: "Deactivate a user account (Admin only)",
  })
  async deactivate(
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const user = await this.usersService.deactivate(id);

    return {
      message: "User account deactivated successfully",
      user: this.toPublicUser(user),
    };
  }
}
