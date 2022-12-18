import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findOne(id: number) {
    const { password, ...user } = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new HttpException('user not exist', HttpStatus.BAD_REQUEST);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const { password, ...data } = createUserDto;
    const rounds = 10;
    const passwordHash = await bcrypt.hash(password, rounds);
    try {
      const user = await this.prisma.user.create({
        data: { password: passwordHash, ...data },
      });

      return user;
    } catch (error) {
      console.log('error:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        // this code handle unique value
        if (error.code === 'P2002') {
          throw new HttpException(
            `${(error?.meta.target as any[]).map((t) => {
              return t[0].toUpperCase() + t.substring(1);
            })} already exist.`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      const passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      updateUserDto = { ...updateUserDto, password: passwordHash };
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return user;
  }

  active(id: number): Promise<any> {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        active: true,
      },
    });
  }

  async updatePassword(id: number, password: string) {
    const rounds = 10;
    const passwordHash = await bcrypt.hash(password, rounds);
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        password: passwordHash,
      },
    });
  }

  async findImgNameById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        img: true,
      },
    });

    return user;
  }
}
