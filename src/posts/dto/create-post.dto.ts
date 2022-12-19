import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(100)
  @ApiProperty()
  content: string;

  // @IsNotEmpty()
  // @IsNumber()
  // @ApiProperty()
  // authorId: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  categoryId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  @ApiProperty()
  tags: number[];

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: false })
  published: boolean;
}
