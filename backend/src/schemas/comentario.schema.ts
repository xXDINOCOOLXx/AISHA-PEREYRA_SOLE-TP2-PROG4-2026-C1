import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ComentarioDocument = HydratedDocument<Comentario>;

@Schema({ timestamps: true })
export class Comentario {
  @Prop({ required: true, trim: true })
  mensaje: string;

  @Prop({ type: Types.ObjectId, ref: 'Publicacion', required: true })
  publicacion: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId;

  @Prop({ default: false })
  modificado: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
