import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { StudentProfileDto } from './dto/student-profile.dto';
import { InstructorProfileDto } from './dto/instructor-profile.dto';

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

  async getUserProfile(id: number): Promise<{
    user: { id: number; email: string; role: string };
    profile: StudentProfileDto | InstructorProfileDto | null;
  }> {
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

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        profile,
      };
    } catch (error) {
      this.logger.error(`getUserProfile failed for userId=${id}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch user profile');
    }
  }

  //
  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
