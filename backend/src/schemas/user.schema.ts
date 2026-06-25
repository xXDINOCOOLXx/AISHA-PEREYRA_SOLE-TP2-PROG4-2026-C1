import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum PerfilUsuario {
  USUARIO = 'usuario',
  ADMINISTRADOR = 'administrador',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, trim: true })
  apellido: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  correo: string;

  @Prop({ required: true, unique: true, trim: true })
  nombreUsuario: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ required: true, trim: true })
  descripcion: string;

  @Prop({ default: '' })
  imagenPerfilUrl: string;

  @Prop({ enum: PerfilUsuario, default: PerfilUsuario.USUARIO })
  perfil: PerfilUsuario;

  @Prop({ default: true })
  activo: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
