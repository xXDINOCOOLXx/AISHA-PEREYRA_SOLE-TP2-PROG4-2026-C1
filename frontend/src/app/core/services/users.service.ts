import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/usuarios`;

  listar(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  crear(formData: FormData): Observable<User> {
    return this.http.post<User>(this.base, formData);
  }

  deshabilitar(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }

  reactivar(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${id}/reactivar`, {});
  }
}
