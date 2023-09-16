import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SingerResponse } from './dto/singer-response';
import { Role } from '@prisma/client';
import { JwtPayload } from '../auth/decorator/user.decorator';
import { UpdateSingerDto } from './dto/update-singer-dto';
import { UploadService } from '../upload/upload.service';

interface SelectedSingerData {
  id: boolean;
  name: boolean;
  info: boolean;
  type: boolean;
  photoName: boolean;
  createdAt: boolean;
  updatedAt: boolean;
}

@Injectable()
export class SingerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  private selectedSingerData: SelectedSingerData = {
    id: true,
    name: true,
    info: true,
    type: true,
    photoName: true,
    createdAt: true,
    updatedAt: true,
  };

  async getAll(page: number, size: number): Promise<SingerResponse[]> {
    return await this.prisma.singer.findMany({
      select: this.selectedSingerData,
      skip: page * size || 0,
      take: size || 0,
    });
  }

  async getOne(singerId: string): Promise<SingerResponse> {
    const singer: SingerResponse = await this.prisma.singer.findUnique({
      where: { id: singerId },
      select: this.selectedSingerData,
    });
    if (!singer) {
      throw new NotFoundException('Singer not found!');
    }
    return singer;
  }

  async update(
    singerId: string,
    singerData: UpdateSingerDto,
    file: Express.Multer.File,
    decodedUser: JwtPayload,
  ): Promise<SingerResponse> {
    if (decodedUser.id !== singerId && decodedUser.role !== Role.ADMIN) {
      throw new UnauthorizedException('Unauthorized user!');
    }
    if (file) {
      this.uploadService.upload(file.originalname, file.buffer);
    }
    await this.getOne(singerId);
    return await this.prisma.singer.update({
      where: { id: singerId },
      data: { ...singerData, photoName: file ? file.originalname : null },
      select: this.selectedSingerData,
    });
  }

  async delete(singerId: string, decodedUser: JwtPayload): Promise<void> {
    if (decodedUser.id !== singerId && decodedUser.role !== Role.ADMIN) {
      throw new UnauthorizedException('Unauthorized user!');
    }
    await this.getOne(singerId);
    await this.prisma.singer.delete({ where: { id: singerId } });
  }
}
