import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { TagsModule } from './tags/tags.module';
import { CommentsModule } from './comments/comments.module';
import { ConfigModule } from '@nestjs/config';
import { PostReactionsModule } from './post-reactions/post-reactions.module';
import { SavesModule } from './saves/saves.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PostsModule,
    UsersModule,
    AuthModule,
    MailModule,
    TagsModule,
    CommentsModule,
    PostReactionsModule,
    SavesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
