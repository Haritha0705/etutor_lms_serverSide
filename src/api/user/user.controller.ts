import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from '../../decorator/roles/roles.decorator';
import { Role } from '../../enum/role.enum';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { UpdateInstructorProfileDto } from './dto/update-instructor-profile.dto';

// import { NoCache } from '../../decorator/no-cache/no-cache.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.ADMIN)
  @Get('all-users')
  getAllUsers(@Query('page') page: string, @Query('limit') limit: string) {
    return this.userService.getAllUsers(+page, +limit);
  }

  @Roles(Role.STUDENT, Role.INSTRUCTOR)
  @Get(':id')
  getUserProfile(@Param('id') id: number) {
    return this.userService.getUserProfile(+id);
  }

  @Patch(':id')
  updateUserProfile(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateStudentProfileDto | UpdateInstructorProfileDto,
  ) {
    return this.userService.updateUserProfile(+id, updateUserDto);
  }

  @Delete(':id')
  deleteUserProfile(@Param('id') id: string) {
    return this.userService.deleteUserProfile(+id);
  }
}
