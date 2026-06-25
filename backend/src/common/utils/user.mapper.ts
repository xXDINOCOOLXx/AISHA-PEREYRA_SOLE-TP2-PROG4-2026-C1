import { UserDocument } from '../../schemas/user.schema';

export function mapUserResponse(user: UserDocument) {
  return {
    id: user._id.toString(),
    nombre: user.nombre,
    apellido: user.apellido,
    correo: user.correo,
    nombreUsuario: user.nombreUsuario,
    fechaNacimiento: user.fechaNacimiento,
    descripcion: user.descripcion,
    imagenPerfilUrl: user.imagenPerfilUrl,
    perfil: user.perfil,
    activo: user.activo,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
