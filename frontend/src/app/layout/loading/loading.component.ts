import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="loading-page">
      <mat-spinner diameter="48"></mat-spinner>
      <p>Cargando...</p>
    </div>
  `,
  styles: [
    `
      .loading-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        color: #666;
      }
    `,
  ],
})
export class LoadingComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.auth.autorizar().subscribe({
      next: () => {
        this.auth.startSessionTimer();
        this.router.navigate(['/publicaciones']);
      },
      error: () => this.router.navigate(['/login']),
    });
  }
}
