import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  CrearComentarioDto,
  EditarComentarioDto,
} from './dto/comentario.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Get('publicaciones/:id/comentarios')
  async listar(
    @Param('id') publicacionId: string,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    return this.comentariosService.listar(publicacionId, offset, limit);
  }

  @Post('publicaciones/:id/comentarios')
  @HttpCode(HttpStatus.CREATED)
  async crear(
    @Param('id') publicacionId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CrearComentarioDto,
  ) {
    return this.comentariosService.crear(publicacionId, user.id, dto);
  }

  @Put('comentarios/:id')
  async editar(
    @Param('id') comentarioId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: EditarComentarioDto,
  ) {
    return this.comentariosService.editar(comentarioId, user.id, dto);
  }
}
