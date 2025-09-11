import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Roles } from '../../decorator/roles/roles.decorator';
import { Role } from '../../enum/role.enum';
import { EnrollmentsService } from './enrollments.service';
import { LessonsService } from './lessons.service';
import { CourseEnrollmentDto } from './dto/create-enrollment.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ReviewService } from './review.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { QuizzesService } from './quizzes.service';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { CreateQuizSubmissionDto } from './dto/create-quiz-submission.dto';

@Roles(Role.INSTRUCTOR, Role.STUDENT)
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly lessonsService: LessonsService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly reviewService: ReviewService,
    private readonly quizzesService: QuizzesService,
    private readonly assignmentsService: AssignmentsService,
  ) {}

  // --- Course endpoints ---
  @Post()
  createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.createCourse(createCourseDto);
  }

  @Get()
  findAllCourses() {
    return this.coursesService.findAllCourses();
  }

  @Get(':id')
  findOneCourse(@Param('id') id: string) {
    return this.coursesService.findOneCourse(+id);
  }

  @Patch(':id')
  updateCourse(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.updateCourse(+id, updateCourseDto);
  }

  @Delete(':id')
  deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(+id);
  }

  // --- Lesson endpoints ---
  @Post('lessons')
  createLesson(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.createLesson(createLessonDto);
  }

  @Get('lessons/course/:id')
  findAllLesson(@Param('id') id: string) {
    return this.lessonsService.findAllLessons(+id);
  }

  @Get('lessons/:id')
  findOneLesson(@Param('id') id: string) {
    return this.lessonsService.findOneLesson(+id);
  }

  @Patch('lessons/:id')
  updateLesson(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.updateLesson(+id, updateLessonDto);
  }

  @Delete('lessons/:id')
  deleteLesson(@Param('id') id: string) {
    return this.lessonsService.deleteLesson(+id);
  }

  // --- Enrollment endpoints ---
  @Post('enroll')
  enroll(@Body() dto: CourseEnrollmentDto) {
    return this.enrollmentsService.enroll(dto);
  }

  @Delete('unenroll')
  unenroll(@Body() dto: CourseEnrollmentDto) {
    return this.enrollmentsService.unenroll(dto);
  }

  // --- Review endpoints ---
  @Post('review')
  createReview(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.createReview(createReviewDto);
  }

  @Get('review/:id')
  ListReviewsForCourse(@Param('id') id: string) {
    return this.reviewService.listReviewsForCourse(+id);
  }

  @Patch('review/:id')
  updateReview(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewService.updateReview(+id, updateReviewDto);
  }

  @Delete('review/:id')
  deleteReview(@Param('id') id: string) {
    return this.reviewService.deleteReview(+id);
  }

  // --- Assignments endpoints ---
  @Post('assignment')
  createAssignment(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.createAssignment(createAssignmentDto);
  }

  @Get('assignment/course/:courseId')
  findAllAssignments(@Param('courseId') courseId: string) {
    return this.assignmentsService.findAllAssignments(+courseId);
  }

  @Get('assignment/:id')
  findOneAssignment(@Param('id') id: string) {
    return this.assignmentsService.findOneAssignment(+id);
  }

  @Patch('assignment/:id')
  updateAssignment(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    return this.assignmentsService.updateAssignment(+id, updateAssignmentDto);
  }

  @Delete('assignment/:id')
  deleteAssignment(@Param('id') id: string) {
    return this.assignmentsService.deleteAssignment(+id);
  }

  // --- Quizzes endpoints ---
  @Post('quizzes')
  createQuiz(@Body() createQuizDto: CreateQuizDto) {
    return this.quizzesService.createQuiz(createQuizDto);
  }

  @Get('quizzes/assignment/:assignmentId')
  findAllQuiz(@Param('assignmentId') assignmentId: string) {
    return this.quizzesService.findAllQuiz(+assignmentId);
  }

  @Get('quizzes/:id')
  findOneQuiz(@Param('id') id: string) {
    return this.quizzesService.findOneQuiz(+id);
  }

  @Patch('quizzes/:id')
  updateQuiz(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizzesService.updateQuiz(+id, updateQuizDto);
  }

  @Delete('quizzes/:id')
  deleteQuiz(@Param('id') id: string) {
    return this.quizzesService.deleteQuiz(+id);
  }

  // --- Quizzes Submission endpoints ---

  @Post('quizzes/submission')
  quizSubmission(@Body() createQuizSubmissionDto: CreateQuizSubmissionDto) {
    return this.quizzesService.quizSubmission(createQuizSubmissionDto);
  }

  @Get('quizzes/submission/student/:studentId')
  findAllQuizSubmissionsByStudent(@Param('studentId') studentId: string) {
    return this.quizzesService.findAllQuizSubmissionsByStudent(+studentId);
  }

  @Get('quizzes/submission/quiz/:quizId')
  findQuizSubmissionsAllByQuiz(@Param('quizId') quizId: string) {
    return this.quizzesService.findQuizSubmissionsAllByQuiz(+quizId);
  }

  @Get('quizzes/submission/:id')
  findOneQuizSubmission(@Param('id') id: string) {
    return this.quizzesService.findOneQuizSubmission(+id);
  }
}
