import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CrearComentarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @MinLength(1)
  mensaje: string;
}

export class EditarComentarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @MinLength(1)
  mensaje: string;
}
