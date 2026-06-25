import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PerfilUsuario } from '../schemas/user.schema';

@Controller('estadisticas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(PerfilUsuario.ADMINISTRADOR)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.estadisticasService.publicacionesPorUsuario(desde, hasta);
  }

  @Get('comentarios')
  comentarios(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.estadisticasService.comentariosPorTiempo(desde, hasta);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.estadisticasService.comentariosPorPublicacion(desde, hasta);
  }
}
