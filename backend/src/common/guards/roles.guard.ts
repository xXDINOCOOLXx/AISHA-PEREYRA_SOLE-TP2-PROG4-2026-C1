import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PerfilUsuario } from '../../schemas/user.schema';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<PerfilUsuario[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles?.length) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user || !requiredRoles.includes(user.perfil)) {
      throw new UnauthorizedException('No tenés permisos para esta acción');
    }
    return true;
  }
}
