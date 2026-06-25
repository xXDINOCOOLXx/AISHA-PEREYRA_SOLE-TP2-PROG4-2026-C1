export interface PostAuthor {
  id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  imagenPerfilUrl: string;
}

export interface Post {
  id: string;
  titulo: string;
  mensaje: string;
  imagenUrl: string;
  autor: PostAuthor;
  likesCount: number;
  likedByMe: boolean;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostsPage {
  items: Post[];
  total: number;
  offset: number;
  limit: number;
}

export interface Comment {
  id: string;
  mensaje: string;
  modificado: boolean;
  autor: PostAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface CommentsPage {
  items: Comment[];
  total: number;
  offset: number;
  limit: number;
}

export interface ChartData {
  labels: string[];
  data: number[];
}
