import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';
import { Response } from 'express';
import { hash, verify } from 'argon2';
import { CreateSignupDto } from 'src/auth/dto/create-signup-dto';

@Injectable()
export class CommonService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signAccessToken(id: string, role: Role): Promise<string> {
    return await this.jwt.signAsync(
      { id, role },
      {
        secret: this.config.getOrThrow('ACCESS_TOKEN_SECRET'),
        expiresIn: 60 * 15,
      },
    );
  }

  async signRefreshToken(id: string, role: Role): Promise<string> {
    return await this.jwt.signAsync(
      { id, role },
      {
        secret: this.config.getOrThrow('REFRESH_TOKEN_SECRET'),
        expiresIn: 60 * 60 * 24 * 7,
      },
    );
  }

  async signCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: await hash(refreshToken) },
    });
  }

  async verifyAdmin(signupData: CreateSignupDto, role: Role): Promise<void> {
    if (role == Role.ADMIN) {
      if (!signupData.productKey) {
        throw new ForbiddenException('Product key not found!');
      }

      const productKey: string = `${
        signupData.email
      }-${role}-${this.config.getOrThrow('PRODUCT_KEY_SECRET')}`;

      const isValidProductKey: boolean = await verify(
        signupData.productKey,
        productKey,
      );

      if (!isValidProductKey) {
        throw new ForbiddenException('Product key is not valid!');
      }
    }

    delete signupData.productKey;
  }

  async findUserById(id: string): Promise<User> {
    const user: User = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new ForbiddenException('User not found!');
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user: User = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new ForbiddenException('User not found!');
    }
    return user;
  }
}
