import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);
  constructor(private readonly DB: PrismaService) {}

  /** Create a new Assignment */
  async createAssignment(createAssignmentDto: CreateAssignmentDto) {
    const { courseId, title, description, instructorId } = createAssignmentDto;

    try {
      const course = await this.DB.course.findUnique({
        where: { id: courseId },
      });
      if (!course)
        throw new NotFoundException(`Course with ID ${courseId} not found`);

      const instructor = await this.DB.instructorProfile.findUnique({
        where: { id: instructorId },
      });
      if (!instructor)
        throw new NotFoundException(
          `Instructor with ID ${instructorId} not found`,
        );

      const assignment = await this.DB.assignment.create({
        data: {
          title,
          description,
          course: { connect: { id: courseId } },
          instructor: { connect: { id: instructorId } },
        },
      });

      return {
        success: true,
        message: 'Assignment created successfully',
        assignment,
      };
    } catch (error) {
      this.logger.error(`Failed to create assignment`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to create assignment');
    }
  }

  /** Get all Assignments for a course */
  async findAllAssignments(courseId: number) {
    try {
      const course = await this.DB.course.findUnique({
        where: { id: courseId },
      });
      if (!course)
        throw new NotFoundException(`Course with ID ${courseId} not found`);

      const assignment = await this.DB.assignment.findMany({
        where: { courseId },
        orderBy: { createdAt: 'desc' },
      });

      return { success: true, data: assignment };
    } catch (error) {
      this.logger.error(
        `Failed to fetch quizzes for course ${courseId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch quizzes');
    }
  }

  /** Get a single Assignment by ID */
  async findOneAssignment(id: number) {
    try {
      const assignment = await this.DB.assignment.findUnique({
        where: { id },
        include: {
          quizzes: true,
        },
      });
      if (!assignment)
        throw new NotFoundException(`Quiz with ID ${id} not found`);

      return { success: true, data: assignment };
    } catch (error) {
      this.logger.error(`Failed to fetch quiz with ID ${id}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch quiz');
    }
  }

  /** Update a Assignment */
  async updateAssignment(id: number, updateAssignmentDto: UpdateAssignmentDto) {
    try {
      const { courseId, instructorId, ...assignmentData } = updateAssignmentDto;

      const existingAssignment = await this.DB.assignment.findUnique({
        where: { id },
      });
      if (!existingAssignment)
        throw new NotFoundException(`Assignment with ID ${id} not found`);

      const data: any = { ...assignmentData };
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

      const updatedAssignment = await this.DB.assignment.update({
        where: { id },
        data,
      });

      return {
        success: true,
        message: 'Quiz updated successfully',
        updatedAssignment,
      };
    } catch (error) {
      this.logger.error(`Failed to update quiz with ID ${id}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update quiz');
    }
  }

  /** Delete a Assignment */
  async deleteAssignment(id: number) {
    try {
      const existingAssignment = await this.DB.assignment.findUnique({
        where: { id },
      });
      if (!existingAssignment)
        throw new NotFoundException(`Quiz with ID ${id} not found`);

      await this.DB.assignment.delete({ where: { id } });

      return {
        success: true,
        message: `Assignment #${id} deleted successfully`,
      };
    } catch (error) {
      this.logger.error(`Failed to delete quiz with ID ${id}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete quiz');
    }
  }
}
