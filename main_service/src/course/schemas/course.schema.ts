import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ImageInfoSchema, ImageInfo } from '../../common_schemas/image.schema';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true})
  description!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacher!: Types.ObjectId;

  @Prop({ type: ImageInfoSchema, required: false })
  cover?: ImageInfo;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Lesson' }], default: [] })
    lessons!: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    students!: Types.ObjectId[];
  
  @Prop({ default: 0 })
    studentsCount!: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);