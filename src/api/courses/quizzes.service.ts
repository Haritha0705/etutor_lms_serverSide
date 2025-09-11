import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizzesService {
  private readonly logger = new Logger(QuizzesService.name);

  constructor(private readonly DB: PrismaService) {}

  /** Create a new Quiz */
  async createQuiz(createQuizDto: CreateQuizDto) {
    const { courseId, question, answers, instructorId } = createQuizDto;

    try {
      // Validate course
      const course = await this.DB.course.findUnique({
        where: { id: courseId },
      });
      if (!course)
        throw new NotFoundException(`Course with ID ${courseId} not found`);

      // Validate instructor
      const instructor = await this.DB.instructorProfile.findUnique({
        where: { id: instructorId },
      });
      if (!instructor)
        throw new NotFoundException(
          `Instructor with ID ${instructorId} not found`,
        );

      // Create quiz
      const quiz = await this.DB.quiz.create({
        data: {
          question,
          answers,
          course: { connect: { id: courseId } },
          instructor: { connect: { id: instructorId } },
        },
      });

      return {
        success: true,
        message: 'Quiz created successfully',
        quiz,
      };
    } catch (error) {
      this.logger.error(`Failed to create quiz`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to create quiz');
    }
  }

  /** Get all Quizzes for a course */
  async findAllQuiz(courseId: number) {
    try {
      const course = await this.DB.course.findUnique({
        where: { id: courseId },
      });
      if (!course)
        throw new NotFoundException(`Course with ID ${courseId} not found`);

      const quizzes = await this.DB.quiz.findMany({
        where: { courseId },
        orderBy: { createdAt: 'desc' },
      });

      return { success: true, data: quizzes };
    } catch (error) {
      this.logger.error(
        `Failed to fetch quizzes for course ${courseId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch quizzes');
    }
  }

  /** Get a single Quiz by ID */
  async findOneQuiz(id: number) {
    try {
      const quiz = await this.DB.quiz.findUnique({ where: { id } });
      if (!quiz) throw new NotFoundException(`Quiz with ID ${id} not found`);

      return { success: true, data: quiz };
    } catch (error) {
      this.logger.error(`Failed to fetch quiz with ID ${id}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch quiz');
    }
  }

  /** Update a Quiz */
  async updateQuiz(id: number, updateQuizDto: UpdateQuizDto) {
    try {
      const { courseId, instructorId, ...quizData } = updateQuizDto;

      const existingQuiz = await this.DB.quiz.findUnique({ where: { id } });
      if (!existingQuiz)
        throw new NotFoundException(`Quiz with ID ${id} not found`);

      const data: any = { ...quizData };
      if (courseId) {
        const course = await this.DB.course.findUnique({
          where: { id: courseId },
        });
        if (!course)
          throw new NotFoundException(`Course with ID ${courseId} not found`);
        data.course = { connect: { id: courseId } };
      }
      if (instructorId) {
        const instructor = await this.DB.instructorProfile.findUnique({
          where: { id: instructorId },
        });
        if (!instructor)
          throw new NotFoundException(
            `Instructor with ID ${instructorId} not found`,
          );
        data.instructor = { connect: { id: instructorId } };
      }

      const updatedQuiz = await this.DB.quiz.update({
        where: { id },
        data,
      });

      return {
        success: true,
        message: 'Quiz updated successfully',
        updatedQuiz,
      };
    } catch (error) {
      this.logger.error(`Failed to update quiz with ID ${id}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update quiz');
    }
  }

  /** Delete a Quiz */
  async deleteQuiz(id: number) {
    try {
      const existingQuiz = await this.DB.quiz.findUnique({ where: { id } });
      if (!existingQuiz)
        throw new NotFoundException(`Quiz with ID ${id} not found`);

      await this.DB.quiz.delete({ where: { id } });

      return {
        success: true,
        message: `Quiz #${id} deleted successfully`,
      };
    } catch (error) {
      this.logger.error(`Failed to delete quiz with ID ${id}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete quiz');
    }
  }
}
