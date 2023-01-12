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
  @IsString()
  @IsOptional()
  cover: string;

  @IsArray()
  //@IsNumber({}, { each: true })
  @IsOptional()
  @ApiProperty()
  /*
   i make type of tags array of string here because you cant send array of number in formdata . i want to convert from string to number in midlleware but i think you need package to get body and overide that.  
  */
  tags: string[];

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: false })
  published: boolean;
}
