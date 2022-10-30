import { OmitType } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto';

export class UpdateCommentDto extends OmitType(CreateCommentDto, [
  'postId',
  'userId',
] as const) {}
