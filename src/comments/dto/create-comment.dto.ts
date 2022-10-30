import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  content: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: false })
  published: boolean;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  postId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  userId: number;
}
