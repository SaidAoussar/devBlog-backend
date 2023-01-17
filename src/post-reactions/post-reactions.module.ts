import { Module } from '@nestjs/common';
import { PostReactionsController } from './post-reactions.controller';
import { PostReactionsService } from './post-reactions.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PostReactionsController],
  providers: [PostReactionsService],
})
export class PostReactionsModule {}
