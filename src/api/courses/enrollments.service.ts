import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CourseEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  private readonly logger = new Logger(EnrollmentsService.name);

  constructor(private readonly DB: PrismaService) {}

  /** Enroll a student in a course */
  async enroll(dto: CourseEnrollmentDto) {
    const { studentId, courseId } = dto;

    try {
      if (!studentId || !courseId) {
        throw new BadRequestException('studentId and courseId are required');
      }

      const student = await this.DB.studentProfile.findUnique({
        where: { id: studentId },
      });
      if (!student) throw new NotFoundException('Student not found');

      const course = await this.DB.course.findUnique({
        where: { id: courseId },
      });
      if (!course) throw new NotFoundException('Course not found');

      let enrollment = await this.DB.courseEnrollment.findUnique({
        where: {
          studentId_courseId: { studentId, courseId },
        },
      });

      if (!enrollment) {
        enrollment = await this.DB.courseEnrollment.create({
          data: { studentId, courseId },
        });
      }

      return {
        success: true,
        status: 200,
        message: 'Enrolled successfully',
        data: { student, enrollment },
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to enroll student ${studentId} in course ${courseId}`,
        error,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to enroll in course');
    }
  }

  /** All Enroll student in a course */
  async allEnrollStudent(courseId: number, page: number, limit: number) {
    try {
      page = page || 1;
      limit = limit || 10;
      const skip = (page - 1) * limit;

      const course = await this.DB.course.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }

      const allcourses = await this.DB.courseEnrollment.findMany({
        skip,
        take: limit,
        where: { courseId },
        orderBy: { enrolledAt: 'desc' },
      });

      const totalCount = await this.DB.courseEnrollment.count({
        where: { courseId },
      });
      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: allcourses,
        meta: {
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch lessons for course ${courseId}`,
        error,
      );
      throw new InternalServerErrorException('Failed to fetch lessons');
    }
  }

  /** Unenroll a student from a course */
  async unenroll(dto: CourseEnrollmentDto) {
    const { studentId, courseId } = dto;

    try {
      if (!studentId || !courseId) {
        throw new BadRequestException('studentId and courseId are required');
      }

      const student = await this.DB.studentProfile.findUnique({
        where: { id: studentId },
      });
      if (!student) throw new NotFoundException('Student not found');

      const course = await this.DB.course.findUnique({
        where: { id: courseId },
      });
      if (!course) throw new NotFoundException('Course not found');

      const existingEnrollment = await this.DB.courseEnrollment.findUnique({
        where: {
          studentId_courseId: { studentId, courseId },
        },
      });

      if (!existingEnrollment) {
        throw new NotFoundException('Enrollment not found');
      }

      const deletedEnrollment = await this.DB.courseEnrollment.delete({
        where: { studentId_courseId: { studentId, courseId } },
      });

      return {
        success: true,
        status: 200,
        message: 'Successfully unenrolled from the course',
        data: deletedEnrollment,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to unenroll student ${studentId} from course ${courseId}`,
        error,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to unenroll from course');
    }
  }
}
