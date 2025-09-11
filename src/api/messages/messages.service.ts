import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { PrismaService } from '../../config/prisma/prisma.service';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);
  constructor(private readonly DB: PrismaService) {}

  /** Send a private message */
  async sendMessage(dto: CreateMessageDto) {
    try {
      const { senderId, receiverId, content } = dto;

      const sender = await this.DB.user.findUnique({
        where: { id: senderId },
      });
      const receiver = await this.DB.user.findUnique({
        where: { id: receiverId },
      });

      if (!sender) throw new NotFoundException(`Sender not found`);
      if (!receiver) throw new NotFoundException(`Receiver not found`);

      const message = await this.DB.message.create({
        data: { senderId, receiverId, content },
      });

      return { success: true, message };
    } catch (error) {
      this.logger.error('Failed to send message', error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to send message');
    }
  }

  /** Get chat history between two users */
  async getChatHistory(user1Id: number, user2Id: number) {
    try {
      return this.DB.message.findMany({
        where: {
          OR: [
            { senderId: user1Id, receiverId: user2Id },
            { senderId: user2Id, receiverId: user1Id },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      this.logger.error('Failed to fetch chat history', error.stack);
      throw new InternalServerErrorException('Failed to fetch chat history');
    }
  }
}
