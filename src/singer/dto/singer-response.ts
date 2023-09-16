import { SingerType } from '@prisma/client';

export class SingerResponse {
  id: string;
  name: string;
  info: string;
  type: SingerType;
  photoName: string;
  createdAt: Date;
  updatedAt: Date;
}
