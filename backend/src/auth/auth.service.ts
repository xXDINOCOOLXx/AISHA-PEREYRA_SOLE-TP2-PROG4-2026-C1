import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegistroDto } from './dto/auth.dto';
import { mapUserResponse } from '../common/utils/user.mapper';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private signToken(user: {
    _id: { toString(): string };
    correo: string;
    nombreUsuario: string;
    perfil: string;
  }) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      correo: user.correo,
      nombreUsuario: user.nombreUsuario,
      perfil: user.perfil as JwtPayload['perfil'],
    };
    return this.jwtService.sign(payload);
  }

  async registro(dto: RegistroDto, imagenPerfilUrl: string) {
    const existeCorreo = await this.usersService.findByCorreo(dto.correo);
    if (existeCorreo) {
      throw new BadRequestException('El correo ya está registrado');
    }
    const existeUsuario = await this.usersService.findByNombreUsuario(
      dto.nombreUsuario,
    );
    if (existeUsuario) {
      throw new BadRequestException('El nombre de usuario ya está en uso');
    }
    const user = await this.usersService.createFromRegistro(dto, imagenPerfilUrl);
    const token = this.signToken(user);
    return { token, user: mapUserResponse(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByIdentificador(dto.identificador);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!user.activo) {
      throw new UnauthorizedException(
        'Tu cuenta está deshabilitada. Contactá al administrador.',
      );
    }
    const passwordValida = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const token = this.signToken(user);
    return { token, user: mapUserResponse(user) };
  }

  async autorizar(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.activo) {
      throw new UnauthorizedException('Token inválido o usuario inactivo');
    }
    return mapUserResponse(user);
  }

  async refrescar(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.activo) {
      throw new UnauthorizedException('Token inválido o usuario inactivo');
    }
    const token = this.signToken(user);
    return { token, user: mapUserResponse(user) };
  }
}
