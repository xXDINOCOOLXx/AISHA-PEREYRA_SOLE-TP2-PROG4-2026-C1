import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [
    `
      .main-content {
        min-height: calc(100vh - 56px);
      }
    `,
  ],
})
export class ShellComponent {
  auth = inject(AuthService);
  router = inject(Router);
}
