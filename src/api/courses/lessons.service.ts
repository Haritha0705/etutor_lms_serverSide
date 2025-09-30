import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PrismaService } from '../../config/prisma/prisma.service';

@Injectable()
export class LessonsService {
  private readonly logger = new Logger(LessonsService.name);
  constructor(private readonly DB: PrismaService) {}

  /** Create a new lesson */
  async createLesson(createLessonDto: CreateLessonDto) {
    const { courseId, title, content } = createLessonDto;

    try {
      const course = await this.DB.course.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }

      const lesson = await this.DB.lesson.create({
        data: {
          title,
          content,
          course: { connect: { id: courseId } },
        },
      });

      return {
        success: true,
        message: 'Lesson created successfully',
        lesson,
      };
    } catch (error) {
      this.logger.error(`Failed to create lesson`, error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to create lesson');
    }
  }

  /** Get all lessons for a course */
  async findAllLessons(courseId: number, page: number, limit: number) {
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

      const lessons = await this.DB.lesson.findMany({
        skip,
        take: limit,
        where: { courseId },
        orderBy: { createdAt: 'desc' },
      });

      const totalCount = await this.DB.lesson.count({
        where: { courseId },
      });
      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: lessons,
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

  /** Get a single lesson by ID */
  async findOneLesson(id: number) {
    try {
      const lesson = await this.DB.lesson.findUnique({ where: { id } });
      if (!lesson) {
        this.logger.warn(`Lesson with ID ${id} not found`);
        throw new NotFoundException(`Lesson with ID ${id} not found`);
      }

      return { success: true, data: lesson };
    } catch (error) {
      this.logger.error(`Failed to fetch lesson with ID ${id}`, error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch lesson');
    }
  }

  /** Update a lesson */
  async updateLesson(id: number, updateLessonDto: UpdateLessonDto) {
    try {
      const { courseId, ...lessonData } = updateLessonDto;

      const existingLesson = await this.DB.lesson.findUnique({ where: { id } });
      if (!existingLesson) {
        throw new NotFoundException(`Lesson with ID ${id} not found`);
      }

      let courseConnect: { connect: { id: number } } | undefined = undefined;
      if (courseId) {
        const courseExists = await this.DB.course.findUnique({
          where: { id: courseId },
        });

        if (!courseExists) {
          throw new NotFoundException(`Course with ID ${courseId} not found`);
        }

        courseConnect = { connect: { id: courseId } };
      }

      const updatedLesson = await this.DB.lesson.update({
        where: { id },
        data: {
          ...lessonData,
          ...(courseConnect ? { course: courseConnect } : {}),
        },
      });

      return {
        success: true,
        message: 'Lesson updated successfully',
        updatedLesson,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update lesson');
    }
  }

  /** Delete a lesson */
  async deleteLesson(id: number) {
    try {
      const existingLesson = await this.DB.lesson.findUnique({ where: { id } });
      if (!existingLesson) {
        throw new NotFoundException(`Lesson with ID ${id} not found`);
      }

      await this.DB.lesson.delete({ where: { id } });

      return {
        success: true,
        message: `Lesson #${id} deleted successfully`,
      };
    } catch (error) {
      this.logger.error(`Failed to delete lesson with ID ${id}`, error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete lesson');
    }
  }
}
