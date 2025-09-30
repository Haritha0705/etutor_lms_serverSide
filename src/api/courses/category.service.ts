import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);
  constructor(private readonly DB: PrismaService) {}

  /** Create a new category */
  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      const category = await this.DB.category.create({
        data: {
          name: createCategoryDto.name,
          icon: createCategoryDto.icon ?? null,
        },
      });

      return category;
    } catch (error) {
      this.logger.error(
        `Failed to create category: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Unable to create category');
    }
  }

  /** Find all categories */
  async findAllCategories() {
    try {
      const categories = await this.DB.category.findMany({
        orderBy: {
          name: 'asc',
        },
        select: {
          name: true,
          icon: true,
          coursesCount: true,
          subCategories: {
            select: {
              name: true,
              coursesCount: true,
            },
          },
          courses: {
            select: {
              title: true,
              price: true,
            },
          },
        },
      });
      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch categories: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Unable to fetch categories');
    }
  }
}
