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
      // Validate instructor
      const instructorExists = await this.DB.instructorProfile.findUnique({
        where: { id: createCourseDto.instructorId },
      });
      if (!instructorExists) {
        throw new NotFoundException(
          `Instructor with ID ${createCourseDto.instructorId} not found`,
        );
      }

      // Validate category
      const category = await this.DB.category.findUnique({
        where: { id: createCourseDto.categoryId },
      });
      if (!category)
        throw new NotFoundException(
          `Category with ID "${createCourseDto.categoryId}" not found`,
        );

      // Validate subCategory
      const subCategory = await this.DB.subCategory.findFirst({
        where: {
          id: createCourseDto.subCategoryId,
          categoryId: category.id,
        },
      });
      if (!subCategory)
        throw new NotFoundException(
          `SubCategory with ID "${createCourseDto.subCategoryId}" not found under category "${category.name}"`,
        );

      // Validate tool
      const tool = await this.DB.tool.findFirst({
        where: {
          id: createCourseDto.toolId,
          subCategoryId: subCategory.id,
        },
      });
      if (!tool)
        throw new NotFoundException(
          `Tool with ID "${createCourseDto.toolId}" not found under subcategory "${subCategory.name}"`,
        );

      // Transaction to create course and increment counts
      const course = await this.DB.$transaction(async (prisma) => {
        const newCourse = await prisma.course.create({
          data: {
            title: createCourseDto.title,
            description: createCourseDto.description,
            duration: createCourseDto.duration,
            level: createCourseDto.level,
            isPaid: createCourseDto.isPaid,
            price: createCourseDto.price,
            instructorId: createCourseDto.instructorId,
            categoryId: category.id,
            subCategoryId: subCategory.id,
            toolId: tool.id,
          },
        });

        // Increment course counts
        await prisma.category.update({
          where: { id: category.id },
          data: { coursesCount: { increment: 1 } },
        });
        await prisma.subCategory.update({
          where: { id: subCategory.id },
          data: { coursesCount: { increment: 1 } },
        });
        await prisma.tool.update({
          where: { id: tool.id },
          data: { coursesCount: { increment: 1 } },
        });

        return newCourse;
      });

      return {
        title: course.title,
        description: course.description,
        duration: course.duration,
        level: course.level,
        isPaid: course.isPaid,
        price: course.price,
        instructorId: course.instructorId,
        categoryName: category.name,
        subCategoryName: subCategory.name,
        toolName: tool.name,
      };
    } catch (error) {
      this.logger.error('Failed to create course', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to create course');
    }
  }

  /** Fetch all courses */
  async findAllCourses(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      const courses = await this.DB.course.findMany({
        skip,
        take: limit,
        include: {
          instructor: true,
          category: true,
          reviews: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      const totalCount = await this.DB.course.count();
      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: courses,
        meta: {
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch courses', error);
      throw new InternalServerErrorException('Failed to fetch courses');
    }
  }

  /** Fetch a course by ID */
  async findOneCourse(id: number) {
    try {
      const course = await this.DB.course.findUnique({
        where: { id },
        include: {
          instructor: true,
          category: true,
          subCategory: true,
          tool: true,
        },
      });

      if (!course) {
        this.logger.warn(`Course not found with ID: ${id}`);
        throw new NotFoundException(`Course with ID ${id} not found`);
      }

      this.logger.log(`Fetched course with ID: ${id}`);
      return { success: true, data: course };
    } catch (error) {
      this.logger.error(`Failed to fetch course with ID: ${id}`, error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch course');
    }
  }

  /** Update a course */
  async updateCourse(id: number, updateCourseDto: UpdateCourseDto) {
    try {
      // Validate course exists
      const existingCourse = await this.DB.course.findUnique({ where: { id } });
      if (!existingCourse) {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }

      // Validate instructor if provided
      if (updateCourseDto.instructorId) {
        const instructorExists = await this.DB.instructorProfile.findUnique({
          where: { id: updateCourseDto.instructorId },
        });
        if (!instructorExists) {
          throw new NotFoundException(
            `Instructor with ID ${updateCourseDto.instructorId} not found`,
          );
        }
      }

      // Validate category, subCategory, and tool if provided
      let category: any;
      if (updateCourseDto.categoryId) {
        category = await this.DB.category.findUnique({
          where: { id: updateCourseDto.categoryId },
        });
        if (!category)
          throw new NotFoundException(
            `Category with ID "${updateCourseDto.categoryId}" not found`,
          );
      }

      let subCategory: any;
      if (updateCourseDto.subCategoryId) {
        subCategory = await this.DB.subCategory.findFirst({
          where: {
            id: updateCourseDto.subCategoryId,
          },
        });
        if (!subCategory)
          throw new NotFoundException(
            `SubCategory with ID "${updateCourseDto.subCategoryId}" not found under category "${category?.name || existingCourse.categoryId}"`,
          );
      }

      let tool: any;
      if (updateCourseDto.toolId) {
        tool = await this.DB.tool.findFirst({
          where: {
            id: updateCourseDto.toolId,
          },
        });
        if (!tool)
          throw new NotFoundException(
            `Tool with ID "${updateCourseDto.toolId}" not found under subcategory "${subCategory.id || existingCourse.subCategoryId}"`,
          );
      }

      // Update course
      const updatedCourse = await this.DB.course.update({
        where: { id },
        data: {
          title: updateCourseDto.title ?? existingCourse.title,
          description:
            updateCourseDto.description ?? existingCourse.description,
          duration: updateCourseDto.duration ?? existingCourse.duration,
          level: updateCourseDto.level ?? existingCourse.level,
          isPaid: updateCourseDto.isPaid ?? existingCourse.isPaid,
          price: updateCourseDto.price ?? existingCourse.price,
          instructorId: existingCourse.instructorId,
          categoryId: category.id ?? existingCourse.categoryId,
          subCategoryId: subCategory.id ?? existingCourse.subCategoryId,
          toolId: tool.id ?? existingCourse.toolId,
        },
      });

      return {
        title: updatedCourse.title,
        description: updatedCourse.description,
        duration: updatedCourse.duration,
        level: updatedCourse.level,
        isPaid: updatedCourse.isPaid,
        price: updatedCourse.price,
        categoryName: category.name,
        subCategoryName: subCategory.name,
        toolName: tool.name,
        instructorId: existingCourse.instructorId,
      };
    } catch (error) {
      this.logger.error(`Failed to update course with ID: ${id}`, error);
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

      return {
        success: true,
        message: `Course #${id} deleted successfully`,
      };
    } catch (error) {
      this.logger.error(`Failed to delete course with ID: ${id}`, error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete course');
    }
  }
}
