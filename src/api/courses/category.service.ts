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
          count: createCategoryDto.count,
          icon: createCategoryDto.icon || null,
        },
      });

      this.logger.log(`Category created with ID ${category.id}`);
      return category;
    } catch (error) {
      this.logger.error(
        `Failed to create category: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Unable to create category');
    }
  }
}
