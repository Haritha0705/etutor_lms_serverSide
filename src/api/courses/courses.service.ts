import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from '../../config/prisma/prisma.service';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);
  constructor(private readonly DB: PrismaService) {}

  /** Create a new course */
  async createCourse(createCourseDto: CreateCourseDto) {
    try {
      const instructorExists = await this.DB.instructorProfile.findUnique({
        where: { id: createCourseDto.instructorId },
      });

      if (!instructorExists) {
        throw new NotFoundException(
          `Instructor with ID ${createCourseDto.instructorId} not found`,
        );
      }
      const course = await this.DB.course.create({
        data: createCourseDto,
      });
      this.logger.log(`Course created successfully: ${course.id}`);
      return {
        success: true,
        message: 'Course created successfully',
        course,
      };
    } catch (error) {
      this.logger.error('Failed to create course', error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to create course');
    }
  }

  /** Fetch all courses */
  async findAllCourses() {
    try {
      const courses = await this.DB.course.findMany({
        include: { instructor: true },
      });
      this.logger.log(`Fetched ${courses.length} courses`);
      return { success: true, data: courses };
    } catch (error) {
      this.logger.error('Failed to fetch courses', error.stack);
      throw new InternalServerErrorException('Failed to fetch courses');
    }
  }

  /** Fetch a course by ID */
  async findOneCourse(id: number) {
    try {
      const course = await this.DB.course.findUnique({
        where: { id },
        include: { instructor: true },
      });

      if (!course) {
        this.logger.warn(`Course not found with ID: ${id}`);
        throw new NotFoundException(`Course with ID ${id} not found`);
      }

      this.logger.log(`Fetched course with ID: ${id}`);
      return { success: true, coursesProfile: course };
    } catch (error) {
      this.logger.error(`Failed to fetch course with ID: ${id}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch course');
    }
  }

  /** Update a course */
  async updateCourse(id: number, updateCourseDto: UpdateCourseDto) {
    try {
      let instructorConnect: { connect: { id: number } } | undefined =
        undefined;
      if (updateCourseDto.instructorId) {
        const instructorExists = await this.DB.instructorProfile.findUnique({
          where: { id: updateCourseDto.instructorId },
        });

        if (!instructorExists) {
          throw new NotFoundException(
            `Instructor with ID ${updateCourseDto.instructorId} not found`,
          );
        }

        instructorConnect = { connect: { id: updateCourseDto.instructorId } };
      }

      const { instructorId, ...courseData } = updateCourseDto;

      const existingCourse = await this.DB.course.findUnique({ where: { id } });
      if (!existingCourse) {
        this.logger.warn(`Course not found for update: ${id}`);
        throw new NotFoundException(`Course with ID ${id} not found`);
      }

      // 3️⃣ Update the course safely
      const updatedCourse = await this.DB.course.update({
        where: { id },
        data: {
          ...courseData,
          ...(instructorConnect ? { instructor: instructorConnect } : {}),
        },
      });

      this.logger.log(`Course updated successfully: ${id}`);
      return {
        success: true,
        message: 'Course updated successfully',
        updateProfile: updatedCourse,
      };
    } catch (error) {
      this.logger.error(`Failed to update course with ID: ${id}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update course');
    }
  }

  /** Delete a course */
  async deleteCourse(id: number) {
    try {
      const existingCourse = await this.DB.course.findUnique({ where: { id } });

      if (!existingCourse) {
        this.logger.warn(`Course not found for deletion: ${id}`);
        throw new NotFoundException(`Course with ID ${id} not found`);
      }

      await this.DB.course.delete({ where: { id } });

      this.logger.log(`Course deleted successfully: ${id}`);
      return {
        success: true,
        message: `Course #${id} deleted successfully`,
      };
    } catch (error) {
      this.logger.error(`Failed to delete course with ID: ${id}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete course');
    }
  }
}
