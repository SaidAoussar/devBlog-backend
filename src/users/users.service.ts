import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number, per_page: number, q: string) {
    if (isNaN(page)) {
      page = 1;
    }

    if (isNaN(per_page)) {
      per_page = 2;
    }

    let where = {};

    if (q) {
      where = {
        OR: [
          {
            username: { contains: q, mode: 'insensitive' },
          },
          {
            AND: [
              { firstName: { contains: q.split(' ')[0], mode: 'insensitive' } },
              { lastName: { contains: q.split(' ')[1], mode: 'insensitive' } },
            ],
          },
        ],
      };
    }

    const total_count = await this.prisma.user.count({
      where,
    });

    if (Math.ceil(total_count / per_page) < page || page < 1) {
      return {};
    }

    const records = await this.prisma.user.findMany({
      skip: per_page * (page - 1),
      take: per_page,
      where,
    });
    return {
      _metadata: {
        page,
        per_page,
        total_count,
      },
      records,
    };
  }

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
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
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
    // if (updateUserDto.password) {
    //   const passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    //   updateUserDto = { ...updateUserDto, password: passwordHash };
    // }

    const { password, ...user } = await this.prisma.user.update({
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

  async setNewPassword(id: number, updatePasswordDto: UpdatePasswordDto) {
    const { currentPassword, password, confirmNewPassword } = updatePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new HttpException('password incorrect', HttpStatus.BAD_REQUEST);
    }

    if (password !== confirmNewPassword) {
      throw new HttpException(
        'password dont match confirm new password field',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const userUpdate = await this.prisma.user.update({
      where: { id },
      select: {
        id: true,
        username: true,
      },
      data: {
        password: hashPassword,
      },
    });
    return userUpdate;
  }
}
