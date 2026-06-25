import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models/user.model';
import { SessionExtendDialogComponent } from '../../shared/components/session-extend-dialog/session-extend-dialog.component';

const TOKEN_KEY = 'rs_token';
const USER_KEY = 'rs_user';
const SESSION_START_KEY = 'rs_session_start';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  currentUser = signal<User | null>(this.loadUser());
  private sessionTimer?: ReturnType<typeof setTimeout>;

  private loadUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  isAdmin(): boolean {
    return this.currentUser()?.perfil === 'administrador';
  }

  login(identificador: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
        identificador,
        password,
      })
      .pipe(tap((res) => this.setSession(res)));
  }

  registro(formData: FormData): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/registro`, formData)
      .pipe(tap((res) => this.setSession(res)));
  }

  autorizar(): Observable<User> {
    return this.http
      .post<User>(`${environment.apiUrl}/auth/autorizar`, {})
      .pipe(tap((user) => this.storeUser(user)));
  }

  refrescar(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/refrescar`, {})
      .pipe(tap((res) => this.setSession(res)));
  }

  actualizarPerfil(formData: FormData): Observable<User> {
    return this.http
      .put<User>(`${environment.apiUrl}/auth/perfil`, formData)
      .pipe(tap((user) => this.storeUser(user)));
  }

  logout(): void {
    clearTimeout(this.sessionTimer);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_START_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    this.storeUser(res.user);
    localStorage.setItem(SESSION_START_KEY, Date.now().toString());
    this.startSessionTimer();
  }

  private storeUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  startSessionTimer(): void {
    clearTimeout(this.sessionTimer);
    this.sessionTimer = setTimeout(() => {
      const ref = this.dialog.open(SessionExtendDialogComponent, {
        disableClose: true,
        width: '400px',
      });
      ref.afterClosed().subscribe((extend) => {
        if (extend) {
          this.refrescar().subscribe({
            next: () =>
              this.snackBar.open('Sesión extendida correctamente', 'Cerrar', {
                duration: 3000,
              }),
            error: () => this.logout(),
          });
        }
      });
    }, 10 * 60 * 1000);
  }

  imageUrl(path: string): string {
    if (!path) return 'assets/images/default-avatar.svg';
    if (path.startsWith('http')) return path;
    return `${environment.uploadsUrl}${path}`;
  }
}
