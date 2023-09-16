import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UploadModule } from './upload/upload.module';
import { PassportModule } from '@nestjs/passport';
import { MailerModule } from '@nestjs-modules/mailer';
import { UserModule } from './user/user.module';
import { SingerModule } from './singer/singer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        auth: {
          user: 'stefancrowley095@gmail.com',
          pass: 'vnwn ovwe rsqd igtc',
        },
      },
    }),
    PassportModule,
    AuthModule,
    PrismaModule,
    CommonModule,
    UploadModule,
    UserModule,
    SingerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
