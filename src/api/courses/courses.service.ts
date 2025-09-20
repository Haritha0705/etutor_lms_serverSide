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

      const category = await this.DB.category.findUnique({
        where: { name: createCourseDto.categoryName },
      });
      if (!category)
        throw new NotFoundException(
          `Category "${createCourseDto.categoryName}" not found`,
        );

      const subCategory = await this.DB.subCategory.findFirst({
        where: {
          name: createCourseDto.subCategoryName,
          categoryId: category.id,
        },
      });
      if (!subCategory)
        throw new NotFoundException(
          `SubCategory "${createCourseDto.subCategoryName}" not found under category "${createCourseDto.categoryName}"`,
        );

      const tool = await this.DB.tool.findFirst({
        where: {
          name: createCourseDto.toolName,
          subCategoryId: subCategory.id,
        },
      });
      if (!tool)
        throw new NotFoundException(
          `Tool "${createCourseDto.toolName}" not found under subcategory "${createCourseDto.subCategoryName}"`,
        );

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
        categoryName: category.name,
        subCategoryName: subCategory.name,
        toolName: tool.name,
        instructorId: course.instructorId,
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
      page = page || 1;
      limit = limit || 10;
      const skip = (page - 1) * limit;

      const courses = await this.DB.course.findMany({
        skip,
        take: limit,
        include: { instructor: true },
        orderBy: { createdAt: 'desc' },
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
        include: { instructor: true },
      });

      if (!course) {
        this.logger.warn(`Course not found with ID: ${id}`);
        throw new NotFoundException(`Course with ID ${id} not found`);
      }

      this.logger.log(`Fetched course with ID: ${id}`);
      return { success: true, coursesProfile: course };
    } catch (error) {
      this.logger.error(`Failed to fetch course with ID: ${id}`, error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch course');
    }
  }

  // /** Update a course */
  // async updateCourse(id: number, updateCourseDto: UpdateCourseDto) {
  //   try {
  //     const { instructorId, ...courseData } = updateCourseDto;
  //
  //     const existingCourse = await this.DB.course.findUnique({ where: { id } });
  //     if (!existingCourse) {
  //       throw new NotFoundException(`Course with ID ${id} not found`);
  //     }
  //
  //     let instructorConnect: { connect: { id: number } } | undefined =
  //       undefined;
  //     if (instructorId) {
  //       const instructorExists = await this.DB.instructorProfile.findUnique({
  //         where: { id: instructorId },
  //       });
  //
  //       if (!instructorExists) {
  //         throw new NotFoundException(
  //           `Instructor with ID ${updateCourseDto.instructorId} not found`,
  //         );
  //       }
  //
  //       instructorConnect = { connect: { id: instructorId } };
  //     }
  //
  //     const updatedCourse = await this.DB.course.update({
  //       where: { id },
  //       data: {
  //         ...courseData,
  //         ...(instructorConnect ? { instructor: instructorConnect } : {}),
  //       },
  //     });
  //
  //     return {
  //       success: true,
  //       message: 'Course updated successfully',
  //       updateProfile: updatedCourse,
  //     };
  //   } catch (error) {
  //     this.logger.error(`Failed to update course with ID: ${id}`, error);
  //     if (error instanceof NotFoundException) throw error;
  //     throw new InternalServerErrorException('Failed to update course');
  //   }
  // }

  /** Update a course */
  async updateCourse(id: number, updateCourseDto: UpdateCourseDto) {
    try {
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

      // Validate category, subCategory, tool
      const category = await this.DB.category.findUnique({
        where: { name: updateCourseDto.categoryName },
      });
      if (!category)
        throw new NotFoundException(
          `Category "${updateCourseDto.categoryName}" not found`,
        );

      const subCategory = await this.DB.subCategory.findFirst({
        where: {
          name: updateCourseDto.subCategoryName,
          categoryId: category.id,
        },
      });
      if (!subCategory)
        throw new NotFoundException(
          `SubCategory "${updateCourseDto.subCategoryName}" not found under category "${updateCourseDto.categoryName}"`,
        );

      const tool = await this.DB.tool.findFirst({
        where: {
          name: updateCourseDto.toolName,
          subCategoryId: subCategory.id,
        },
      });
      if (!tool)
        throw new NotFoundException(
          `Tool "${updateCourseDto.toolName}" not found under subcategory "${updateCourseDto.subCategoryName}"`,
        );

      // Update course
      const updatedCourse = await this.DB.course.update({
        where: { id },
        data: {
          title: updateCourseDto.title,
          description: updateCourseDto.description,
          duration: updateCourseDto.duration,
          level: updateCourseDto.level,
          isPaid: updateCourseDto.isPaid,
          price: updateCourseDto.price,
          instructorId: updateCourseDto.instructorId,
          categoryId: category.id,
          subCategoryId: subCategory.id,
          toolId: tool.id,
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
        instructorId: updatedCourse.instructorId,
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
