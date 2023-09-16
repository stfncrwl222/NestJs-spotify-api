import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SingerService } from './singer.service';
import { RoleGuard } from '../auth/guard/role.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '@prisma/client';
import { SingerResponse } from './dto/singer-response';
import { AtGuard } from '../auth/guard/at.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtPayload, UserDecorator } from '../auth/decorator/user.decorator';
import { UpdateSingerDto } from './dto/update-singer-dto';

@Controller('singers')
export class SingerController {
  constructor(private readonly singerService: SingerService) {}

  @Get()
  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN)
  async getAll(
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number,
  ): Promise<SingerResponse[]> {
    return this.singerService.getAll(page, size);
  }

  @Get(':singerId')
  @UseGuards(AtGuard)
  async getOne(@Param('singerId') singerId: string): Promise<SingerResponse> {
    return this.singerService.getOne(singerId);
  }

  @Put(':singerId')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AtGuard)
  async update(
    @Param('singerId') singerId: string,
    @Body() singerData: UpdateSingerDto,
    @UploadedFile() file: Express.Multer.File,
    @UserDecorator() decodedUser: JwtPayload,
  ): Promise<SingerResponse> {
    return this.singerService.update(singerId, singerData, file, decodedUser);
  }

  @Delete(':singerId')
  @UseGuards(AtGuard)
  @HttpCode(204)
  async delete(
    @Param('singerId') singerId: string,
    @UserDecorator() decodedUser: JwtPayload,
  ): Promise<void> {
    return this.singerService.delete(singerId, decodedUser);
  }
}
