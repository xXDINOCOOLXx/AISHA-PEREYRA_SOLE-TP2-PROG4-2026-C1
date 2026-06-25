import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comment, CommentsPage } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private http = inject(HttpClient);

  listar(
    publicacionId: string,
    offset = 0,
    limit = 5,
  ): Observable<CommentsPage> {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);
    return this.http.get<CommentsPage>(
      `${environment.apiUrl}/publicaciones/${publicacionId}/comentarios`,
      { params },
    );
  }

  crear(publicacionId: string, mensaje: string): Observable<Comment> {
    return this.http.post<Comment>(
      `${environment.apiUrl}/publicaciones/${publicacionId}/comentarios`,
      { mensaje },
    );
  }

  editar(comentarioId: string, mensaje: string): Observable<Comment> {
    return this.http.put<Comment>(
      `${environment.apiUrl}/comentarios/${comentarioId}`,
      { mensaje },
    );
  }
}
