
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "./entities/user.entity";
import { Role } from "@/common/enums/role.enum";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateUserRoleDto } from "./dto/update-user-role.dto";
import { UserQueryDto } from "./dto/user-query.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Create a user (used by the authentication module).
  async create(
    fullName: string,
    email: string,
    passwordHash: string,
    role: Role,
  ): Promise<User> {
    const user = this.userRepository.create({
      fullName,
      email: email.trim().toLowerCase(),
      passwordHash,
      role,
    });

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  // Find a user by email.
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        email: email.trim().toLowerCase(),
      },
    });
  }

  // Find a user by email, including the password hash for login.
  async findByEmailWithPassword(
    email: string,
  ): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("user.email = :email", {
        email: email.trim().toLowerCase(),
      })
      .getOne();
  }

  // Find a user by ID.
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  // Find a user by ID or throw 404.
  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  // Get users with pagination.
  async findAll(query: UserQueryDto) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: {
        createdAt: "DESC",
      },
    });

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Update a user's profile information.
  async updateProfile(
    id: string,
    dto: UpdateUserDto,
  ): Promise<User> {
    if (dto.fullName === undefined && dto.email === undefined) {
      throw new BadRequestException(
        "At least one profile field must be provided",
      );
    }

    const user = await this.findByIdOrThrow(id);

    if (dto.fullName !== undefined) {
      user.fullName = dto.fullName;
    }

    if (dto.email !== undefined) {
      user.email = dto.email.trim().toLowerCase();
    }

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  // Update a user's role.
  async updateRole(
    id: string,
    dto: UpdateUserRoleDto,
  ): Promise<User> {
    const user = await this.findByIdOrThrow(id);

    user.role = dto.role;

    return this.userRepository.save(user);
  }

  // Deactivate a user account without deleting its database record.
  async deactivate(id: string): Promise<User> {
    const user = await this.findByIdOrThrow(id);

    user.isActive = false;

    return this.userRepository.save(user);
  }

  // Convert PostgreSQL unique-constraint errors into HTTP 409.
  private handleDatabaseError(error: unknown): never {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new ConflictException(
        "Email address is already registered",
      );
    }

    throw error;
  }
}
