import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from '../../decorator/roles/roles.decorator';
import { Role } from '../../enum/role.enum';

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
  getUserProfile(@Param('id') id: string) {
    return this.userService.getUserProfile(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
