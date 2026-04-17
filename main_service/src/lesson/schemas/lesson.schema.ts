import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ImageInfoSchema, ImageInfo } from '../../common_schemas/image.schema';

export type LessonDocument = HydratedDocument<Lesson>;

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true})
  textContent!: string;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course!: Types.ObjectId;

  @Prop({ type: [ImageInfoSchema], default: [] })
  images!: ImageInfo[];

  @Prop({ required: true })
  order!: number;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);