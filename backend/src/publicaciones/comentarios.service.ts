import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comentario, ComentarioDocument } from '../schemas/comentario.schema';
import {
  Publicacion,
  PublicacionDocument,
} from '../schemas/publicacion.schema';
import { UserDocument } from '../schemas/user.schema';
import {
  CrearComentarioDto,
  EditarComentarioDto,
} from './dto/comentario.dto';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name)
    private comentarioModel: Model<ComentarioDocument>,
    @InjectModel(Publicacion.name)
    private publicacionModel: Model<PublicacionDocument>,
  ) {}

  private mapComentario(com: ComentarioDocument) {
    const autor = com.autor as unknown as UserDocument;
    return {
      id: com._id.toString(),
      mensaje: com.mensaje,
      modificado: com.modificado,
      autor: autor?._id
        ? {
            id: autor._id.toString(),
            nombre: autor.nombre,
            apellido: autor.apellido,
            nombreUsuario: autor.nombreUsuario,
            imagenPerfilUrl: autor.imagenPerfilUrl,
          }
        : com.autor,
      createdAt: com.createdAt,
      updatedAt: com.updatedAt,
    };
  }

  async listar(publicacionId: string, offset = 0, limit = 5) {
    const pub = await this.publicacionModel.findOne({
      _id: publicacionId,
      activa: true,
    });
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada');
    }
    const filter = { publicacion: publicacionId };
    const [items, total] = await Promise.all([
      this.comentarioModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('autor', 'nombre apellido nombreUsuario imagenPerfilUrl'),
      this.comentarioModel.countDocuments(filter),
    ]);
    return {
      items: items.map((c) => this.mapComentario(c)),
      total,
      offset,
      limit,
    };
  }

  async crear(publicacionId: string, userId: string, dto: CrearComentarioDto) {
    const pub = await this.publicacionModel.findOne({
      _id: publicacionId,
      activa: true,
    });
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada');
    }
    const comentario = await this.comentarioModel.create({
      mensaje: dto.mensaje,
      publicacion: publicacionId,
      autor: userId,
    });
    const populated = await comentario.populate(
      'autor',
      'nombre apellido nombreUsuario imagenPerfilUrl',
    );
    return this.mapComentario(populated);
  }

  async editar(comentarioId: string, userId: string, dto: EditarComentarioDto) {
    const comentario = await this.comentarioModel.findById(comentarioId);
    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado');
    }
    if (comentario.autor.toString() !== userId) {
      throw new ForbiddenException('Solo podés editar tus propios comentarios');
    }
    comentario.mensaje = dto.mensaje;
    comentario.modificado = true;
    await comentario.save();
    const populated = await comentario.populate(
      'autor',
      'nombre apellido nombreUsuario imagenPerfilUrl',
    );
    return this.mapComentario(populated);
  }
}
