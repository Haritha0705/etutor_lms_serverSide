import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { Category } from '../../enum/category.enum';
import { SubCategory } from '../../enum/subCategory.enum';
import { Level } from '../../enum/level.enum';
import { Duration } from '../../enum/duration.enum';

@Injectable()
export class FilterService {
  private readonly logger = new Logger(FilterService.name);
  constructor(private readonly DB: PrismaService) {}

  /** Filtering courses using only Course table fields */
  async filterCourses(query: {
    categoryName?: Category;
    subCategoryName?: SubCategory;
    level?: Level;
    duration?: Duration;
    isPaid?: boolean;
  }) {
    const where: any = {};

    if (query.categoryName) {
      where.categoryName = query.categoryName;
    }

    if (query.subCategoryName) {
      where.subCategoryName = query.subCategoryName;
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
    });
  }
}
