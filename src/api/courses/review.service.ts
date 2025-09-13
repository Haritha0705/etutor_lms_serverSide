import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);
  constructor(private readonly DB: PrismaService) {}

  /** Create a new review for a course */
  async createReview(createReviewDto: CreateReviewDto) {
    const { studentId, courseId, rating, comment } = createReviewDto;

    try {
      if (!studentId || !courseId || !rating || !comment) {
        throw new BadRequestException(
          'studentId, courseId ,comment and rating are required',
        );
      }

      const course = await this.DB.course.findUnique({
        where: { id: courseId },
      });
      if (!course) throw new NotFoundException('Course not found');

      const student = await this.DB.studentProfile.findUnique({
        where: { id: studentId },
      });
      if (!student) throw new NotFoundException('Student not found');

      const enrollment = await this.DB.courseEnrollment.findUnique({
        where: { studentId_courseId: { studentId, courseId } },
      });
      if (!enrollment)
        throw new BadRequestException('Student is not enrolled in this course');

      const existingReview = await this.DB.review.findUnique({
        where: { studentId_courseId: { studentId, courseId } },
      });
      if (existingReview)
        throw new BadRequestException('You have already reviewed this course');

      const review = await this.DB.review.create({
        data: {
          studentId,
          courseId,
          rating,
          comment,
        },
      });

      return { success: true, data: review };
    } catch (error) {
      this.logger.error(
        `Failed to create review for course ${courseId}`,
        error,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Failed to create review');
    }
  }

  /** List all reviews for a specific course */
  async listReviewsForCourse(courseId: number, page: number, limit: number) {
    try {
      page = page || 1;
      limit = limit || 10;
      const skip = (page - 1) * limit;

      const course = await this.DB.course.findUnique({
        where: { id: courseId },
      });
      if (!course) throw new NotFoundException('Course not found');

      const reviews = await this.DB.review.findMany({
        skip,
        take: limit,
        where: { courseId },
        include: { student: true },
        orderBy: { createdAt: 'desc' },
      });

      const totalCount = await this.DB.review.count({
        where: { courseId },
      });
      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: reviews,
        meta: {
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to list reviews for course ${courseId}`, error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch reviews');
    }
  }

  /** Update a review */
  async updateReview(id: number, updateReviewDto: UpdateReviewDto) {
    try {
      const { studentId, courseId, ...reviewData } = updateReviewDto;

      if (!studentId || !courseId) {
        throw new BadRequestException('studentId and courseId are required');
      }

      const existingCourse = await this.DB.course.findUnique({
        where: { id: courseId },
      });
      if (!existingCourse) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }

      const existingStudent = await this.DB.studentProfile.findUnique({
        where: { id: studentId },
      });
      if (!existingStudent) {
        throw new NotFoundException(`Student with ID ${studentId} not found`);
      }

      const existingReview = await this.DB.review.findUnique({
        where: { studentId_courseId: { studentId, courseId } },
      });
      if (!existingReview) {
        throw new NotFoundException(
          `Review for course ${courseId} by student ${studentId} not found`,
        );
      }

      const updatedReview = await this.DB.review.update({
        where: { studentId_courseId: { studentId, courseId } },
        data: {
          ...reviewData,
        },
      });

      return {
        success: true,
        message: 'Review updated successfully',
        data: updatedReview,
      };
    } catch (error) {
      this.logger.error(`Failed to update review with ID ${id}`, error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update review');
    }
  }

  /** Delete a review */
  async deleteReview(id: number) {
    try {
      const existingReview = await this.DB.review.findUnique({
        where: { id },
      });

      if (!existingReview) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }

      await this.DB.review.delete({
        where: { id },
      });

      return {
        success: true,
        message: `Review #${id} deleted successfully`,
      };
    } catch (error) {
      this.logger.error(`Failed to delete review with ID ${id}`, error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete review');
    }
  }
}
