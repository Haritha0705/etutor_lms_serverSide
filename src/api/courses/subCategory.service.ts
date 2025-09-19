import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateSubCategoryDto } from './dto/create-subCategory.dto';

@Injectable()
export class SubCategoryService {
  private readonly logger = new Logger(SubCategoryService.name);
  constructor(private readonly DB: PrismaService) {}

  /** Create a new sub Category */
  async createSubCategory(createSubCategoryDto: CreateSubCategoryDto) {
    try {
      const category = await this.DB.category.findUnique({
        where: { id: createSubCategoryDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `SubCategory with id ${createSubCategoryDto.categoryId} not found`,
        );
      }

      const subCategory = await this.DB.subCategory.create({
        data: {
          name: createSubCategoryDto.name,
          coursesCount: 0,
          categoryId: createSubCategoryDto.categoryId,
        },
      });

      this.logger.log(`Tool created with ID ${subCategory.id}`);
      return subCategory;
    } catch (error) {
      this.logger.error(`Failed to create tool: ${error.message}`, error.stack);
      throw new BadRequestException('Unable to create tool');
    }
  }
}
