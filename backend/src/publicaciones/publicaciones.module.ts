import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Publicacion,
  PublicacionSchema,
} from '../schemas/publicacion.schema';
import { Comentario, ComentarioSchema } from '../schemas/comentario.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { PublicacionesService } from './publicaciones.service';
import { PublicacionesController } from './publicaciones.controller';
import { ComentariosService } from './comentarios.service';
import { ComentariosController } from './comentarios.controller';
import { EstadisticasService } from './estadisticas.service';
import { EstadisticasController } from './estadisticas.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [
    PublicacionesController,
    ComentariosController,
    EstadisticasController,
  ],
  providers: [
    PublicacionesService,
    ComentariosService,
    EstadisticasService,
  ],
})
export class PublicacionesModule {}
