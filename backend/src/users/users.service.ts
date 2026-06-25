import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import {
  ActualizarPerfilDto,
  CrearUsuarioAdminDto,
  RegistroDto,
} from '../auth/dto/auth.dto';
import { PerfilUsuario } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createFromRegistro(
    dto: RegistroDto,
    imagenPerfilUrl: string,
    perfil: PerfilUsuario = PerfilUsuario.USUARIO,
  ) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.userModel.create({
      ...dto,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      passwordHash,
      imagenPerfilUrl,
      perfil,
    });
  }

  async findByCorreo(correo: string) {
    return this.userModel.findOne({ correo: correo.toLowerCase() });
  }

  async findByNombreUsuario(nombreUsuario: string) {
    return this.userModel.findOne({ nombreUsuario });
  }

  async findByIdentificador(identificador: string) {
    const user =
      (await this.findByCorreo(identificador)) ||
      (await this.findByNombreUsuario(identificador));
    return user;
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  async findAll() {
    return this.userModel.find().sort({ createdAt: -1 });
  }

  async updateProfile(userId: string, dto: ActualizarPerfilDto, imagenPerfilUrl?: string) {
    const update: Record<string, unknown> = { ...dto };
    if (dto.fechaNacimiento) {
      update.fechaNacimiento = new Date(dto.fechaNacimiento);
    }
    if (imagenPerfilUrl) {
      update.imagenPerfilUrl = imagenPerfilUrl;
    }
    return this.userModel.findByIdAndUpdate(userId, update, { new: true });
  }

  async createByAdmin(dto: CrearUsuarioAdminDto, imagenPerfilUrl: string) {
    return this.createFromRegistro(dto, imagenPerfilUrl, dto.perfil);
  }

  async deshabilitar(id: string) {
    return this.userModel.findByIdAndUpdate(id, { activo: false }, { new: true });
  }

  async reactivar(id: string) {
    return this.userModel.findByIdAndUpdate(id, { activo: true }, { new: true });
  }
}
