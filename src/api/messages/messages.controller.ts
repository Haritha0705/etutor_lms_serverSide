import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Roles } from '../../decorator/roles/roles.decorator';
import { Role } from '../../enum/role.enum';

@Roles(Role.STUDENT, Role.INSTRUCTOR)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  sendMessage(@Body() dto: CreateMessageDto) {
    return this.messagesService.sendMessage(dto);
  }

  @Get('chat/:user1Id/:user2Id')
  getChatHistory(
    @Param('user1Id') user1Id: string,
    @Param('user2Id') user2Id: string,
  ) {
    return this.messagesService.getChatHistory(+user1Id, +user2Id);
  }
}
