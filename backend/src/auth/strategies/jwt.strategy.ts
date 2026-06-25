import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { PerfilUsuario } from '../../schemas/user.schema';

export interface JwtPayload {
  sub: string;
  correo: string;
  nombreUsuario: string;
  perfil: PerfilUsuario;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario no autorizado');
    }
    return {
      id: user._id.toString(),
      correo: user.correo,
      nombreUsuario: user.nombreUsuario,
      perfil: user.perfil,
    };
  }
}
