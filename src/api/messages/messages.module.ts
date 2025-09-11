import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { PrismaModule } from '../../config/prisma/prisma.module';
import { MessagesGateway } from './messages.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
})
export class MessagesModule {}
