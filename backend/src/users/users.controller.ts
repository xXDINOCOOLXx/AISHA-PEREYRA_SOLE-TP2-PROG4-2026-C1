import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PerfilUsuario } from '../schemas/user.schema';
import { CrearUsuarioAdminDto } from '../auth/dto/auth.dto';
import { mapUserResponse } from '../common/utils/user.mapper';
import {
  buildFileUrl,
  createImageStorage,
  getUploadPath,
  imageFileFilter,
} from '../common/utils/file-upload.util';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(PerfilUsuario.ADMINISTRADOR)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async listar() {
    const users = await this.usersService.findAll();
    return users.map(mapUserResponse);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: createImageStorage(getUploadPath(), 'perfil'),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async crear(
    @Body() dto: CrearUsuarioAdminDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
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
    const imagenPerfilUrl = file ? buildFileUrl(file.filename) : '';
    const user = await this.usersService.createByAdmin(dto, imagenPerfilUrl);
    return mapUserResponse(user);
  }

  @Delete(':id')
  async deshabilitar(@Param('id') id: string) {
    const user = await this.usersService.deshabilitar(id);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    return { message: 'Usuario deshabilitado correctamente' };
  }

  @Post(':id/reactivar')
  async reactivar(@Param('id') id: string) {
    const user = await this.usersService.reactivar(id);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    return { message: 'Usuario reactivado correctamente' };
  }
}
