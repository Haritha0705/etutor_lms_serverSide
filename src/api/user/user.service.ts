import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../config/prisma/prisma.service';

@Injectable()
export class UserService {
  private cache: any[] | null = null;
  constructor(private readonly DB: PrismaService) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    if (this.cache) {
      console.log('cache'); // data comes from cache
      return this.cache;
    }

    console.log('normal'); // fetching from DB
    const data = await this.DB.user.findMany({});

    if (data) {
      console.log('db'); // confirmed fetched from DB
      this.cache = data; // store in cache for next time
    }

    return data;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
