import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
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
  @Get('all')
  getAllUsers() {
    return this.userService.getAllUsers();
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

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
