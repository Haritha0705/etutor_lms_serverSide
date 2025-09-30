import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @IsNotEmpty()
  senderId: number;

  @IsInt()
  @IsNotEmpty()
  receiverId: number;
}
