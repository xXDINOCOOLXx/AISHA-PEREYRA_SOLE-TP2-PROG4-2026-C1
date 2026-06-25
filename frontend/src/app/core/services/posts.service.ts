import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Post, PostsPage } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/publicaciones`;

  listar(params: {
    sort?: 'fecha' | 'likes';
    userId?: string;
    offset?: number;
    limit?: number;
  }): Observable<PostsPage> {
    let httpParams = new HttpParams();
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.userId) httpParams = httpParams.set('userId', params.userId);
    if (params.offset != null)
      httpParams = httpParams.set('offset', params.offset);
    if (params.limit != null) httpParams = httpParams.set('limit', params.limit);
    return this.http.get<PostsPage>(this.base, { params: httpParams });
  }

  obtener(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.base}/${id}`);
  }

  crear(formData: FormData): Observable<Post> {
    return this.http.post<Post>(this.base, formData);
  }

  eliminar(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }

  darLike(id: string): Observable<Post> {
    return this.http.post<Post>(`${this.base}/${id}/like`, {});
  }

  quitarLike(id: string): Observable<Post> {
    return this.http.delete<Post>(`${this.base}/${id}/like`);
  }

  imageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.uploadsUrl}${path}`;
  }
}
