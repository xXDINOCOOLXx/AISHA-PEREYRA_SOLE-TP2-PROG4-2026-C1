import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { PerfilUsuario } from '../../schemas/user.schema';

export class RegistroDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @IsEmail({}, { message: 'El correo no es válido' })
  correo: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  nombreUsuario: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/[A-Z]/, {
    message: 'La contraseña debe contener al menos una mayúscula',
  })
  @Matches(/[0-9]/, {
    message: 'La contraseña debe contener al menos un número',
  })
  password: string;

  @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
  fechaNacimiento: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  descripcion: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Ingresá tu correo o nombre de usuario' })
  identificador: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}

export class CrearUsuarioAdminDto extends RegistroDto {
  @IsEnum(PerfilUsuario, { message: 'El perfil debe ser usuario o administrador' })
  perfil: PerfilUsuario;
}

export class ActualizarPerfilDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo no es válido' })
  correo?: string;

  @IsOptional()
  @IsString()
  nombreUsuario?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
