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

  async getAllUsers(): Promise<{ id: number; email: string; role: string }[]> {
    try {
      const users = await this.DB.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      return users;
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

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
