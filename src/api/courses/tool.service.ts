import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateToolDto } from './dto/create-tool.dto';

@Injectable()
export class ToolService {
  private readonly logger = new Logger(ToolService.name);
  constructor(private readonly DB: PrismaService) {}

  /** Create a new tool */
  async createTool(createToolDto: CreateToolDto) {
    try {
      const subCategory = await this.DB.subCategory.findUnique({
        where: { id: createToolDto.subCategoryId },
      });

      if (!subCategory) {
        throw new NotFoundException(
          `SubCategory with id ${createToolDto.subCategoryId} not found`,
        );
      }

      const tool = await this.DB.tool.create({
        data: {
          name: createToolDto.name,
          coursesCount: 0,
          subCategoryId: createToolDto.subCategoryId,
        },
      });

      this.logger.log(`Tool created with ID ${tool.id}`);
      return tool;
    } catch (error) {
      this.logger.error(`Failed to create tool: ${error.message}`, error.stack);
      throw new BadRequestException('Unable to create tool');
    }
  }
}
