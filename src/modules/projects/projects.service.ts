
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DataSource, In } from "typeorm";

import { Project } from "./entities/project.entity";
import { ProjectSkill } from "./entities/project-skill.entity";
import { Skill } from "@/modules/profiles/entities/skill.entity";
import { User } from "@/modules/users/entities/user.entity";
import { CreateProjectDto } from "./dto/create-project.dto";

@Injectable()
export class ProjectsService {
  constructor(private readonly dataSource: DataSource) {}

  async create(clientId: string, dto: CreateProjectDto): Promise<Project> {
    if (
      dto.budgetMin !== undefined &&
      dto.budgetMax !== undefined &&
      dto.budgetMin > dto.budgetMax
    ) {
      throw new BadRequestException(
        "Minimum budget cannot exceed maximum budget",
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const projectRepository = manager.getRepository(Project);
      const skillRepository = manager.getRepository(Skill);
      const projectSkillRepository = manager.getRepository(ProjectSkill);

      const client = await userRepository.findOne({
        where: { id: clientId },
      });

      if (!client) {
        throw new NotFoundException("Client account not found");
      }

      let skills: Skill[] = [];

      if (dto.skillIds?.length) {
        skills = await skillRepository.find({
          where: { id: In(dto.skillIds) },
        });

        if (skills.length !== dto.skillIds.length) {
          throw new BadRequestException(
            "One or more provided skill IDs do not exist",
          );
        }
      }

      const project = projectRepository.create({
        client,
        title: dto.title,
        description: dto.description,
        projectType: dto.projectType,
        budgetMin: dto.budgetMin?.toString() ?? null,
        budgetMax: dto.budgetMax?.toString() ?? null,
        currency: dto.currency ?? "BDT",
        deadline: dto.deadline ?? null,
      });

      const savedProject = await projectRepository.save(project);

      if (skills.length > 0) {
        const projectSkills = skills.map((skill) =>
          projectSkillRepository.create({
            project: savedProject,
            skill,
          }),
        );

        await projectSkillRepository.save(projectSkills);
      }

      const result = await projectRepository.findOne({
        where: { id: savedProject.id },
        relations: {
          client: true,
          projectSkills: {
            skill: true,
          },
        },
      });

      if (!result) {
        throw new NotFoundException("Project could not be retrieved");
      }

      return result;
    });
  }
}
