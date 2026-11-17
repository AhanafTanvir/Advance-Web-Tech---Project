
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ProfessionalProfile } from "./entities/professional-profile.entity";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(ProfessionalProfile)
    private readonly profileRepository: Repository<ProfessionalProfile>,
  ) {}

  async create(
    userId: string,
    createProfileDto: CreateProfileDto,
  ): Promise<ProfessionalProfile> {
    const existingProfile = await this.profileRepository.findOne({
      where: {
        user: { id: userId },
      },
    });

    if (existingProfile) {
      throw new ConflictException(
        "A professional profile already exists for this user.",
      );
    }

    try {
      const profile = this.profileRepository.create({
        ...createProfileDto,
        user: { id: userId },
      });

      return await this.profileRepository.save(profile);
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505"
      ) {
        throw new ConflictException(
          "A professional profile already exists for this user.",
        );
      }

      throw error;
    }
  }

  async findMyProfile(userId: string): Promise<ProfessionalProfile> {
    const profile = await this.profileRepository.findOne({
      where: {
        user: { id: userId },
      },
      relations: {
        user: false,
      },
    });

    if (!profile) {
      throw new NotFoundException("Professional profile not found.");
    }

    return profile;
  }

  async updateMyProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<ProfessionalProfile> {
    const profile = await this.findMyProfile(userId);

    Object.assign(profile, updateProfileDto);

    return this.profileRepository.save(profile);
  }
}
