import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  createLesson(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.createLesson(createLessonDto);
  }

  @Get('course/:id')
  findAllLesson(@Param('id') id: string) {
    return this.lessonsService.findAllLessons(+id);
  }

  @Get(':id')
  findOneLesson(@Param('id') id: string) {
    return this.lessonsService.findOneLesson(+id);
  }

  @Patch(':id')
  updateLesson(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.updateLesson(+id, updateLessonDto);
  }

  @Delete(':id')
  deleteLesson(@Param('id') id: string) {
    return this.lessonsService.deleteLesson(+id);
  }
}
