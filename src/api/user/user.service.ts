import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { StudentProfileDto } from './dto/student-profile.dto';
import { InstructorProfileDto } from './dto/instructor-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { UpdateInstructorProfileDto } from './dto/update-instructor-profile.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly DB: PrismaService) {}

  async getAllUsers(page: number, limit: number) {
    try {
      page = page || 1;
      limit = limit || 10;
      const skip = (page - 1) * limit;

      const users = await this.DB.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
        },
        orderBy: { enrolledAt: 'desc' },
      });

      const totalCount = await this.DB.user.count();
      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: users,
        meta: {
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error(`getAllUsers failed`, error.stack);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async getUserProfile(
    id: number,
  ): Promise<StudentProfileDto | InstructorProfileDto | null> {
    try {
      const user = await this.DB.user.findUnique({
        where: { id },
        include: {
          studentProfile: true,
          instructorProfile: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      let profile: StudentProfileDto | InstructorProfileDto | null = null;

      if (user.role === 'student') {
        profile = user.studentProfile ?? null;
      } else if (user.role === 'instructor') {
        profile = user.instructorProfile ?? null;
      }

      return profile;
    } catch (error) {
      this.logger.error(`getUserProfile failed for userId=${id}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch user profile');
    }
  }

  async updateUserProfile(
    id: number,
    updateUserDto: UpdateStudentProfileDto | UpdateInstructorProfileDto,
  ): Promise<StudentProfileDto | InstructorProfileDto | null> {
    try {
      const user = await this.DB.user.findUnique({
        where: { id },
        include: {
          studentProfile: true,
          instructorProfile: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      let updatedProfile: StudentProfileDto | InstructorProfileDto | null =
        null;

      if (user.role === 'student') {
        if (!user.studentProfile) {
          throw new NotFoundException(
            `Student profile for user ID ${id} not found`,
          );
        }

        updatedProfile = await this.DB.studentProfile.update({
          where: { id: user.studentProfile.id },
          data: updateUserDto as UpdateStudentProfileDto,
        });
      } else if (user.role === 'instructor') {
        if (!user.instructorProfile) {
          throw new NotFoundException(
            `Instructor profile for user ID ${id} not found`,
          );
        }

        updatedProfile = await this.DB.instructorProfile.update({
          where: { id: user.instructorProfile.id },
          data: updateUserDto as UpdateInstructorProfileDto,
        });
      }

      return updatedProfile;
    } catch (error) {
      this.logger.error(
        `updateUserProfile failed for userId=${id}`,
        error.stack,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update user profile');
    }
  }

  async deleteUserProfile(id: number) {
    try {
      const user = await this.DB.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      await this.DB.user.delete({ where: { id } });

      return {
        success: true,
        message: `User with ID #${id} and related profile deleted successfully.`,
        userId: id,
      };
    } catch (error) {
      this.logger.error(
        `deleteUserProfile failed for userId=${id}`,
        error.stack,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
