import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuizSubmissionDto } from './dto/create-quiz-submission.dto';

@Injectable()
export class QuizzesService {
  private readonly logger = new Logger(QuizzesService.name);

  constructor(private readonly DB: PrismaService) {}

  /** Create a new Quiz */
  async createQuiz(createQuizDto: CreateQuizDto) {
    const { assignmentId, question, answers, correctAnswer } = createQuizDto;

    try {
      const assignment = await this.DB.assignment.findUnique({
        where: { id: assignmentId },
      });
      if (!assignment)
        throw new NotFoundException(`Course with ID ${assignmentId} not found`);

      const quiz = await this.DB.quiz.create({
        data: {
          question,
          answers,
          correctAnswer,
          assignment: { connect: { id: assignmentId } },
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
  async findAllQuiz(assignmentId: number) {
    try {
      const assignment = await this.DB.assignment.findUnique({
        where: { id: assignmentId },
      });
      if (!assignment)
        throw new NotFoundException(
          `Assignment with ID ${assignmentId} not found`,
        );

      const quizzes = await this.DB.quiz.findMany({
        where: { assignmentId },
        orderBy: { createdAt: 'desc' },
      });

      return { success: true, data: quizzes };
    } catch (error) {
      this.logger.error(
        `Failed to fetch quizzes for course ${assignmentId}`,
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
      const { assignmentId, ...quizData } = updateQuizDto;

      const existingQuiz = await this.DB.quiz.findUnique({ where: { id } });
      if (!existingQuiz)
        throw new NotFoundException(`Quiz with ID ${id} not found`);

      const data: any = { ...quizData };
      if (assignmentId) {
        const assignment = await this.DB.assignment.findUnique({
          where: { id: assignmentId },
        });
        if (!assignment)
          throw new NotFoundException(
            `Course with ID ${assignmentId} not found`,
          );
        data.assignment = { connect: { id: assignmentId } };
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

  /** Submit a new quiz answer */
  async quizSubmission(createQuizSubmissionDto: CreateQuizSubmissionDto) {
    const { studentId, quizId, answer } = createQuizSubmissionDto;

    try {
      const quiz = await this.DB.quiz.findUnique({ where: { id: quizId } });
      if (!quiz)
        throw new NotFoundException(`Quiz with ID ${quizId} not found`);

      const student = await this.DB.studentProfile.findUnique({
        where: { id: studentId },
      });
      if (!student)
        throw new NotFoundException(`Student with ID ${studentId} not found`);

      const score = quiz.correctAnswer === answer ? 1 : 0;

      const submission = await this.DB.studentQuizSubmission.create({
        data: { studentId, quizId, answer, score },
        include: { quiz: true, student: true },
      });
      return {
        success: true,
        message: `Quiz #${quizId} is ${score === 1 ? 'Correct' : 'Wrong'}`,
        submission,
      };
    } catch (err) {
      this.logger.error(`Failed to create quiz submission`, err.stack);
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      )
        throw err;
      throw new InternalServerErrorException(
        'Failed to create quiz submission',
      );
    }
  }

  /** All submissions by a student */
  async findAllQuizSubmissionsByStudent(studentId: number) {
    return this.DB.studentQuizSubmission.findMany({
      where: { studentId },
      include: { quiz: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** All submissions for a quiz */
  async findQuizSubmissionsAllByQuiz(quizId: number) {
    return this.DB.studentQuizSubmission.findMany({
      where: { quizId },
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Single submission */
  async findOneQuizSubmission(id: number) {
    const submission = await this.DB.studentQuizSubmission.findUnique({
      where: { id },
      include: { student: true, quiz: true },
    });
    if (!submission) throw new NotFoundException(`Submission ${id} not found`);
    return submission;
  }
}
