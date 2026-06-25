import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PublicacionDocument = HydratedDocument<Publicacion>;

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ required: true, trim: true })
  titulo: string;

  @Prop({ required: true, trim: true })
  mensaje: string;

  @Prop({ default: '' })
  imagenUrl: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[];

  @Prop({ default: true })
  activa: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
