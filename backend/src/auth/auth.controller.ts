import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { ActualizarPerfilDto, LoginDto, RegistroDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { mapUserResponse } from '../common/utils/user.mapper';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  buildFileUrl,
  createImageStorage,
  getUploadPath,
  imageFileFilter,
} from '../common/utils/file-upload.util';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: createImageStorage(getUploadPath(), 'perfil'),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async registro(
    @Body() dto: RegistroDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('La imagen de perfil es obligatoria');
    }
    const imagenPerfilUrl = buildFileUrl(file.filename);
    return this.authService.registro(dto, imagenPerfilUrl);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('autorizar')
  @UseGuards(JwtAuthGuard)
  async autorizar(@CurrentUser() user: { id: string }) {
    return this.authService.autorizar(user.id);
  }

  @Post('refrescar')
  @UseGuards(JwtAuthGuard)
  async refrescar(@CurrentUser() user: { id: string }) {
    return this.authService.refrescar(user.id);
  }

  @Put('perfil')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: createImageStorage(getUploadPath(), 'perfil'),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async actualizarPerfil(
    @CurrentUser() user: { id: string },
    @Body() dto: ActualizarPerfilDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (dto.correo) {
      const existe = await this.usersService.findByCorreo(dto.correo);
      if (existe && existe._id.toString() !== user.id) {
        throw new BadRequestException('El correo ya está registrado');
      }
    }
    if (dto.nombreUsuario) {
      const existe = await this.usersService.findByNombreUsuario(dto.nombreUsuario);
      if (existe && existe._id.toString() !== user.id) {
        throw new BadRequestException('El nombre de usuario ya está en uso');
      }
    }
    const imagenPerfilUrl = file ? buildFileUrl(file.filename) : undefined;
    const updated = await this.usersService.updateProfile(
      user.id,
      dto,
      imagenPerfilUrl,
    );
    if (!updated) {
      throw new BadRequestException('Usuario no encontrado');
    }
    return mapUserResponse(updated);
  }
}
