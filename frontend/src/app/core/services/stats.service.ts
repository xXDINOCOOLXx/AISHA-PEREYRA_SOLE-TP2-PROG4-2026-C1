import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChartData } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/estadisticas`;

  private params(desde?: string, hasta?: string): HttpParams {
    let p = new HttpParams();
    if (desde) p = p.set('desde', desde);
    if (hasta) p = p.set('hasta', hasta);
    return p;
  }

  publicacionesPorUsuario(desde?: string, hasta?: string): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.base}/publicaciones-por-usuario`, {
      params: this.params(desde, hasta),
    });
  }

  comentarios(desde?: string, hasta?: string): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.base}/comentarios`, {
      params: this.params(desde, hasta),
    });
  }

  comentariosPorPublicacion(desde?: string, hasta?: string): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.base}/comentarios-por-publicacion`, {
      params: this.params(desde, hasta),
    });
  }
}
