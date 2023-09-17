import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SingerAlbumResponse } from './dto/singer-album-response';
import { JwtPayload } from '../auth/decorator/user.decorator';
import { UploadService } from '../upload/upload.service';
import { Role } from '@prisma/client';
import { UpdateSingerAlbumDto } from './dto/update-singer-album-dto';

interface SelectedSingerAlbumData {
  id: boolean;
  name: boolean;
  photoName: boolean;
  userId: boolean;
}

@Injectable()
export class SingerAlbumService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  private selectedSingerAlbumData: SelectedSingerAlbumData = {
    id: true,
    name: true,
    photoName: true,
    userId: true,
  };

  async getAll(page: number, size: number): Promise<SingerAlbumResponse[]> {
    return await this.prisma.singerAlbum.findMany({
      select: this.selectedSingerAlbumData,
      skip: page * size || 0,
      take: size || 0,
    });
  }

  async getOne(singerAlbumId: string): Promise<SingerAlbumResponse> {
    const singerAlbum: SingerAlbumResponse =
      await this.prisma.singerAlbum.findUnique({
        where: { id: singerAlbumId },
        select: this.selectedSingerAlbumData,
      });
    if (!singerAlbum) {
      throw new NotFoundException('Singer Album not found!');
    }
    return singerAlbum;
  }

  async update(
    singerAlbumData: UpdateSingerAlbumDto,
    singerAlbumId: string,
    decodedUser: JwtPayload,
    file: Express.Multer.File,
  ): Promise<SingerAlbumResponse> {
    const singerAlbum: SingerAlbumResponse = await this.getOne(singerAlbumId);
    if (
      decodedUser.id !== singerAlbum.userId &&
      decodedUser.role !== Role.ADMIN
    ) {
      throw new UnauthorizedException('Unauthorized user!');
    }
    if (file) {
      this.uploadService.upload(file.originalname, file.buffer);
    }

    return await this.prisma.singerAlbum.update({
      where: { id: singerAlbumId },
      data: { ...singerAlbumData, photoName: file ? file.originalname : null },
      select: this.selectedSingerAlbumData,
    });
  }

  async delete(singerAlbumId: string, decodedUser: JwtPayload): Promise<void> {
    const singerAlbum: SingerAlbumResponse = await this.getOne(singerAlbumId);
    if (
      decodedUser.id !== singerAlbum.userId &&
      decodedUser.role !== Role.ADMIN
    ) {
      throw new UnauthorizedException('Unauthorized user!');
    }
    await this.prisma.singerAlbum.delete({
      where: { id: singerAlbumId },
    });
  }
}
