
import {
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "./entities/user.entity";
import { Role } from "@/common/enums/role.enum";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

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
      // PostgreSQL unique-constraint violation
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505"
      ) {
        throw new ConflictException("Email address is already registered");
      }

      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        email: email.trim().toLowerCase(),
      },
    });
  }

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

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }
}
