import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CrearPublicacionDto } from './dto/publicacion.dto';
import { PerfilUsuario } from '../schemas/user.schema';
import {
  buildFileUrl,
  createImageStorage,
  getUploadPath,
  imageFileFilter,
} from '../common/utils/file-upload.util';

@Controller('publicaciones')
@UseGuards(JwtAuthGuard)
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: createImageStorage(getUploadPath(), 'post'),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async crear(
    @Body() dto: CrearPublicacionDto,
    @CurrentUser() user: { id: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imagenUrl = file ? buildFileUrl(file.filename) : '';
    return this.publicacionesService.crear(dto, user.id, imagenUrl);
  }

  @Get()
  async listar(
    @Query('sort') sort?: string,
    @Query('userId') userId?: string,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @CurrentUser() user?: { id: string },
  ) {
    return this.publicacionesService.listar({
      sort,
      userId,
      offset,
      limit,
      currentUserId: user?.id,
    });
  }

  @Get(':id')
  async obtener(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.publicacionesService.findById(id, user.id);
  }

  @Delete(':id')
  async eliminar(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; perfil: PerfilUsuario },
  ) {
    return this.publicacionesService.bajaLogica(id, user.id, user.perfil);
  }

  @Post(':id/like')
  async darLike(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.publicacionesService.darLike(id, user.id);
  }

  @Delete(':id/like')
  async quitarLike(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.publicacionesService.quitarLike(id, user.id);
  }
}
