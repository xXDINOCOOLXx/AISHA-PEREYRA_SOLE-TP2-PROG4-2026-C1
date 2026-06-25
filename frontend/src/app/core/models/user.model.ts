export type PerfilUsuario = 'usuario' | 'administrador';

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  imagenPerfilUrl: string;
  perfil: PerfilUsuario;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
