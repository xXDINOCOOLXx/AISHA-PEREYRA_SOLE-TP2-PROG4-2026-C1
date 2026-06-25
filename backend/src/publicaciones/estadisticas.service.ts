import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Publicacion,
  PublicacionDocument,
} from '../schemas/publicacion.schema';
import { Comentario, ComentarioDocument } from '../schemas/comentario.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private publicacionModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name)
    private comentarioModel: Model<ComentarioDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private buildDateFilter(desde?: string, hasta?: string) {
    if (!desde && !hasta) return {};
    const filter: Record<string, Date> = {};
    if (desde) filter.$gte = new Date(desde);
    if (hasta) {
      const end = new Date(hasta);
      end.setHours(23, 59, 59, 999);
      filter.$lte = end;
    }
    return { createdAt: filter };
  }

  async publicacionesPorUsuario(desde?: string, hasta?: string) {
    const dateFilter = this.buildDateFilter(desde, hasta);
    const result = await this.publicacionModel.aggregate([
      { $match: { activa: true, ...dateFilter } },
      { $group: { _id: '$autor', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
    const users = await this.userModel.find({
      _id: { $in: result.map((r) => r._id) },
    });
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));
    return {
      labels: result.map((r) => {
        const u = userMap.get(r._id.toString());
        return u ? `${u.nombre} ${u.apellido}` : 'Usuario';
      }),
      data: result.map((r) => r.total),
    };
  }

  async comentariosPorTiempo(desde?: string, hasta?: string) {
    const dateFilter = this.buildDateFilter(desde, hasta);
    const result = await this.comentarioModel.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return {
      labels: result.map((r) => r._id),
      data: result.map((r) => r.total),
    };
  }

  async comentariosPorPublicacion(desde?: string, hasta?: string) {
    const dateFilter = this.buildDateFilter(desde, hasta);
    const result = await this.comentarioModel.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$publicacion', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);
    const pubs = await this.publicacionModel.find({
      _id: { $in: result.map((r) => r._id) },
    });
    const pubMap = new Map(pubs.map((p) => [p._id.toString(), p]));
    return {
      labels: result.map((r) => {
        const p = pubMap.get(r._id.toString());
        return p ? p.titulo : 'Publicación';
      }),
      data: result.map((r) => r.total),
    };
  }
}
