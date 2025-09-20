import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
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
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { FilterService } from './filter.service';
import { CategoryService } from './category.service';
import { SubCategoryService } from './subCategory.service';
import { ToolService } from './tool.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSubCategoryDto } from './dto/create-subCategory.dto';
import { CreateToolDto } from './dto/create-tool.dto';
import { Public } from '../../decorator/public/public.decorator';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly lessonsService: LessonsService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly reviewService: ReviewService,
    private readonly quizzesService: QuizzesService,
    private readonly assignmentsService: AssignmentsService,
    private readonly certificatesService: CertificatesService,
    private readonly categoryService: CategoryService,
    private readonly subCategoryService: SubCategoryService,
    private readonly toolService: ToolService,
    private readonly filterService: FilterService,
  ) {}

  // --- Course endpoints ---

  @Roles(Role.INSTRUCTOR)
  @Post()
  createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.createCourse(createCourseDto);
  }

  @Public()
  @Get()
  findAllCourses(@Query('page') page: string, @Query('limit') limit: string) {
    return this.coursesService.findAllCourses(+page, +limit);
  }

  @Public()
  @Get(':id')
  findOneCourse(@Param('id') id: string) {
    return this.coursesService.findOneCourse(+id);
  }

  @Roles(Role.INSTRUCTOR)
  @Put(':id')
  updateCourse(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.updateCourse(+id, updateCourseDto);
  }

  @Roles(Role.INSTRUCTOR)
  @Delete(':id')
  deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(+id);
  }

  // --- Lesson endpoints ---

  @Roles(Role.STUDENT)
  @Post('lessons')
  createLesson(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.createLesson(createLessonDto);
  }

  @Roles(Role.STUDENT)
  @Get('lessons/course/:id')
  findAllLesson(
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.lessonsService.findAllLessons(+id, +page, +limit);
  }

  @Roles(Role.STUDENT)
  @Get('lessons/:id')
  findOneLesson(@Param('id') id: string) {
    return this.lessonsService.findOneLesson(+id);
  }

  @Roles(Role.INSTRUCTOR)
  @Patch('lessons/:id')
  updateLesson(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.updateLesson(+id, updateLessonDto);
  }

  @Roles(Role.INSTRUCTOR)
  @Delete('lessons/:id')
  deleteLesson(@Param('id') id: string) {
    return this.lessonsService.deleteLesson(+id);
  }

  // --- Enrollment endpoints ---

  @Roles(Role.STUDENT)
  @Post('enroll')
  enroll(@Body() dto: CourseEnrollmentDto) {
    return this.enrollmentsService.enroll(dto);
  }

  @Roles(Role.STUDENT)
  @Get('enroll/course/:id')
  allEnrollStudent(
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.enrollmentsService.allEnrollStudent(+id, +page, +limit);
  }

  @Roles(Role.STUDENT)
  @Post('unenroll')
  unenroll(@Body() dto: CourseEnrollmentDto) {
    return this.enrollmentsService.unenroll(dto);
  }

  // --- Review endpoints ---

  @Roles(Role.INSTRUCTOR)
  @Post('review')
  createReview(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.createReview(createReviewDto);
  }

  @Roles(Role.STUDENT)
  @Get('review/:id')
  ListReviewsForCourse(
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.reviewService.listReviewsForCourse(+id, +page, +limit);
  }

  @Roles(Role.STUDENT)
  @Patch('review/:id')
  updateReview(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewService.updateReview(+id, updateReviewDto);
  }

  @Roles(Role.STUDENT)
  @Delete('review/:id')
  deleteReview(@Param('id') id: string) {
    return this.reviewService.deleteReview(+id);
  }

  // --- Assignments endpoints ---

  @Roles(Role.INSTRUCTOR)
  @Post('assignment')
  createAssignment(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.createAssignment(createAssignmentDto);
  }

  @Roles(Role.STUDENT)
  @Get('assignment/course/:courseId')
  findAllAssignments(
    @Param('courseId') courseId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.assignmentsService.findAllAssignments(+courseId, +page, +limit);
  }

  @Roles(Role.STUDENT)
  @Get('assignment/:id')
  findOneAssignment(@Param('id') id: string) {
    return this.assignmentsService.findOneAssignment(+id);
  }

  @Roles(Role.INSTRUCTOR)
  @Patch('assignment/:id')
  updateAssignment(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    return this.assignmentsService.updateAssignment(+id, updateAssignmentDto);
  }

  @Roles(Role.INSTRUCTOR)
  @Delete('assignment/:id')
  deleteAssignment(@Param('id') id: string) {
    return this.assignmentsService.deleteAssignment(+id);
  }

  // --- Quizzes endpoints ---

  @Roles(Role.INSTRUCTOR)
  @Post('quizzes')
  createQuiz(@Body() createQuizDto: CreateQuizDto) {
    return this.quizzesService.createQuiz(createQuizDto);
  }

  @Roles(Role.STUDENT)
  @Get('quizzes/assignment/:assignmentId')
  findAllQuiz(
    @Param('assignmentId') assignmentId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.quizzesService.findAllQuiz(+assignmentId, +page, +limit);
  }

  @Roles(Role.STUDENT)
  @Get('quizzes/:id')
  findOneQuiz(@Param('id') id: string) {
    return this.quizzesService.findOneQuiz(+id);
  }

  @Roles(Role.INSTRUCTOR)
  @Patch('quizzes/:id')
  updateQuiz(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizzesService.updateQuiz(+id, updateQuizDto);
  }

  @Roles(Role.INSTRUCTOR)
  @Delete('quizzes/:id')
  deleteQuiz(@Param('id') id: string) {
    return this.quizzesService.deleteQuiz(+id);
  }

  // --- Quizzes Submission endpoints ---

  @Roles(Role.INSTRUCTOR)
  @Post('quizzes/submission')
  quizSubmission(@Body() createQuizSubmissionDto: CreateQuizSubmissionDto) {
    return this.quizzesService.quizSubmission(createQuizSubmissionDto);
  }

  @Roles(Role.STUDENT)
  @Get('quizzes/submission/student/:studentId')
  findAllQuizSubmissionsByStudent(
    @Param('studentId') studentId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.quizzesService.findAllQuizSubmissionsByStudent(
      +studentId,
      +page,
      +limit,
    );
  }

  @Roles(Role.STUDENT)
  @Get('quizzes/submission/quiz/:quizId')
  findQuizSubmissionsAllByQuiz(
    @Param('quizId') quizId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.quizzesService.findQuizSubmissionsAllByQuiz(
      +quizId,
      +page,
      +limit,
    );
  }

  @Roles(Role.STUDENT)
  @Get('quizzes/submission/:id')
  findOneQuizSubmission(@Param('id') id: string) {
    return this.quizzesService.findOneQuizSubmission(+id);
  }

  // --- Certificate endpoints ---

  @Roles(Role.STUDENT)
  @Post('certificates')
  getCertificateInfo(@Body() createCertificateDto: CreateCertificateDto) {
    return this.certificatesService.getCertificateInfo(createCertificateDto);
  }

  @Roles(Role.STUDENT)
  @Get('certificates/courses/:courseId')
  async getCertificate(
    @Param('courseId') courseId: string,
    @Body('studentId') studentId: string,
  ) {
    return this.certificatesService.getCertificate(+courseId, +studentId);
  }

  @Roles(Role.STUDENT)
  @Get('certificates/student/:studentId')
  async listUserCertificates(
    @Param('studentId') studentId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.certificatesService.listUserCertificates(
      +studentId,
      +page,
      +limit,
    );
  }

  // --- Category endpoints ---

  @Roles(Role.INSTRUCTOR)
  @Post('category')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  // --- SubCategory endpoints ---

  @Roles(Role.INSTRUCTOR)
  @Post('sub-category')
  createSubCategory(@Body() dto: CreateSubCategoryDto) {
    return this.subCategoryService.createSubCategory(dto);
  }

  // --- Tool endpoints ---

  @Roles(Role.INSTRUCTOR)
  @Post('tool')
  createTool(@Body() dto: CreateToolDto) {
    return this.toolService.createTool(dto);
  }

  // --- Filter endpoints ---

  @Roles(Role.INSTRUCTOR)
  @Post('filter')
  filterCourses(
    @Query('categoryName') categoryName?: string,
    @Query('subCategoryName') subCategoryName?: string,
    @Query('toolName') toolName?: string,
    @Query('level') level?: string,
    @Query('duration') duration?: string,
    @Query('isPaid') isPaid?: string,
  ) {
    const isPaidBool =
      isPaid === undefined ? undefined : isPaid.toLowerCase() === 'true';

    return this.filterService.filterCourses({
      categoryName,
      subCategoryName,
      toolName,
      level,
      duration,
      isPaid: isPaidBool,
    });
  }
}
