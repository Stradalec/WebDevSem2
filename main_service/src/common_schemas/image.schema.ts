import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum ImageStatus {
  PROCESSING = 'processing',
  READY = 'ready',
}

@Schema({ _id: false })
export class ImageInfo {
  @Prop({ required: true })
  url!: string;

  @Prop({ required: true, enum: ImageStatus, default: ImageStatus.PROCESSING })
  status!: ImageStatus;
}

export const ImageInfoSchema = SchemaFactory.createForClass(ImageInfo);