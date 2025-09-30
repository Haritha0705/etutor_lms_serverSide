import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({ namespace: '/messages', cors: true })
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`user_${data.userId}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() dto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.sendMessage(dto);

    this.server.to(`user_${dto.receiverId}`).emit('receive_message', message);

    return message;
  }

  @SubscribeMessage('get_history')
  async handleHistory(
    @MessageBody() data: { userId: number; otherUserId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId, otherUserId } = data;

    const history = await this.messagesService.getChatHistory(
      userId,
      otherUserId,
    );

    client.emit('chat_history', history);
  }
}
