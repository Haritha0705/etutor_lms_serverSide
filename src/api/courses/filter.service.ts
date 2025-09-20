import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';

@Injectable()
export class FilterService {
  private readonly logger = new Logger(FilterService.name);
  constructor(private readonly DB: PrismaService) {}

  /** Filtering courses dynamically using DB values */
  async filterCourses(query: {
    categoryName?: string;
    subCategoryName?: string;
    toolName?: string;
    level?: string;
    duration?: string;
    isPaid?: boolean;
  }) {
    const where: any = {};

    if (query.categoryName) {
      const category = await this.DB.category.findUnique({
        where: { name: query.categoryName },
      });
      if (!category) {
        throw new Error(`Category "${query.categoryName}" not found`);
      }
      where.categoryId = category.id;
    }

    if (query.subCategoryName) {
      const subCategory = await this.DB.subCategory.findUnique({
        where: { name: query.subCategoryName },
      });
      if (!subCategory) {
        throw new Error(`SubCategory "${query.subCategoryName}" not found`);
      }
      where.subCategoryId = subCategory.id;
    }

    if (query.toolName) {
      const tool = await this.DB.tool.findUnique({
        where: { name: query.toolName },
      });
      if (!tool) {
        throw new Error(`Tool "${query.toolName}" not found`);
      }
      where.toolId = tool.id;
    }

    if (query.level) {
      where.level = query.level;
    }

    if (query.duration) {
      where.duration = query.duration;
    }

    if (query.isPaid !== undefined) {
      where.isPaid = query.isPaid;
    }

    return this.DB.course.findMany({
      where,
      include: {
        category: true,
        subCategory: true,
        tool: true,
        instructor: true,
      },
    });
  }
}
