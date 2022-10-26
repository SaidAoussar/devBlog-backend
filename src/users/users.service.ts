import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(email: string): Promise<User | undefined> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const { password, ...data } = createUserDto;
    const rounds = 10;
    const passwordHash = await bcrypt.hash(password, rounds);
    return this.prisma.user.create({
      data: { password: passwordHash, ...data },
    });
  }
}
