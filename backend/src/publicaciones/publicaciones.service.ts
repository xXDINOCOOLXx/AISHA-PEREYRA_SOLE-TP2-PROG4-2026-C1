import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Publicacion,
  PublicacionDocument,
} from '../schemas/publicacion.schema';
import { Comentario, ComentarioDocument } from '../schemas/comentario.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { CrearPublicacionDto } from './dto/publicacion.dto';
import { PerfilUsuario } from '../schemas/user.schema';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private publicacionModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name)
    private comentarioModel: Model<ComentarioDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private mapPublicacion(pub: PublicacionDocument, currentUserId?: string) {
    const autor = pub.autor as unknown as UserDocument;
    const likes = pub.likes?.map((l) => l.toString()) || [];
    return {
      id: pub._id.toString(),
      titulo: pub.titulo,
      mensaje: pub.mensaje,
      imagenUrl: pub.imagenUrl,
      autor: autor?._id
        ? {
            id: autor._id.toString(),
            nombre: autor.nombre,
            apellido: autor.apellido,
            nombreUsuario: autor.nombreUsuario,
            imagenPerfilUrl: autor.imagenPerfilUrl,
          }
        : pub.autor,
      likesCount: likes.length,
      likedByMe: currentUserId ? likes.includes(currentUserId) : false,
      activa: pub.activa,
      createdAt: pub.createdAt,
      updatedAt: pub.updatedAt,
    };
  }

  async crear(dto: CrearPublicacionDto, autorId: string, imagenUrl = '') {
    const pub = await this.publicacionModel.create({
      ...dto,
      imagenUrl,
      autor: new Types.ObjectId(autorId),
    });
    const populated = await pub.populate('autor', 'nombre apellido nombreUsuario imagenPerfilUrl');
    return this.mapPublicacion(populated, autorId);
  }

  async listar(params: {
    sort?: string;
    userId?: string;
    offset?: number;
    limit?: number;
    currentUserId?: string;
  }) {
    const offset = params.offset ?? 0;
    const limit = params.limit ?? 10;
    const filter: Record<string, unknown> = { activa: true };
    if (params.userId) {
      filter.autor = new Types.ObjectId(params.userId);
    }

    const sort: Record<string, 1 | -1> =
      params.sort === 'likes'
        ? { likes: -1, createdAt: -1 }
        : { createdAt: -1 };

    const [items, total] = await Promise.all([
      this.publicacionModel
        .find(filter)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .populate('autor', 'nombre apellido nombreUsuario imagenPerfilUrl'),
      this.publicacionModel.countDocuments(filter),
    ]);

    return {
      items: items.map((p) => this.mapPublicacion(p, params.currentUserId)),
      total,
      offset,
      limit,
    };
  }

  async findById(id: string, currentUserId?: string) {
    const pub = await this.publicacionModel
      .findOne({ _id: id, activa: true })
      .populate('autor', 'nombre apellido nombreUsuario imagenPerfilUrl');
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada');
    }
    return this.mapPublicacion(pub, currentUserId);
  }

  async bajaLogica(
    id: string,
    userId: string,
    perfil: PerfilUsuario,
  ) {
    const pub = await this.publicacionModel.findById(id);
    if (!pub || !pub.activa) {
      throw new NotFoundException('Publicación no encontrada');
    }
    const esAutor = pub.autor.toString() === userId;
    const esAdmin = perfil === PerfilUsuario.ADMINISTRADOR;
    if (!esAutor && !esAdmin) {
      throw new ForbiddenException('No podés eliminar esta publicación');
    }
    pub.activa = false;
    await pub.save();
    await this.comentarioModel.deleteMany({ publicacion: pub._id });
    return { message: 'Publicación eliminada correctamente' };
  }

  async darLike(publicacionId: string, userId: string) {
    const pub = await this.publicacionModel.findOne({
      _id: publicacionId,
      activa: true,
    });
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada');
    }
    const userObjectId = new Types.ObjectId(userId);
    const yaDioLike = pub.likes.some((l) => l.toString() === userId);
    if (yaDioLike) {
      return this.mapPublicacion(
        await pub.populate('autor', 'nombre apellido nombreUsuario imagenPerfilUrl'),
        userId,
      );
    }
    pub.likes.push(userObjectId);
    await pub.save();
    const populated = await pub.populate('autor', 'nombre apellido nombreUsuario imagenPerfilUrl');
    return this.mapPublicacion(populated, userId);
  }

  async quitarLike(publicacionId: string, userId: string) {
    const pub = await this.publicacionModel.findOne({
      _id: publicacionId,
      activa: true,
    });
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada');
    }
    pub.likes = pub.likes.filter((l) => l.toString() !== userId);
    await pub.save();
    const populated = await pub.populate('autor', 'nombre apellido nombreUsuario imagenPerfilUrl');
    return this.mapPublicacion(populated, userId);
  }
}
