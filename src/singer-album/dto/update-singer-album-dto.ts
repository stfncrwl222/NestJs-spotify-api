import { IsOptional, IsString } from 'class-validator';

export class UpdateSingerAlbumDto {
  @IsOptional()
  @IsString()
  name: string;
}
