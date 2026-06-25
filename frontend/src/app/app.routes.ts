import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  { path: 'loading', loadComponent: () => import('./layout/loading/loading.component').then(m => m.LoadingComponent) },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/registro/registro.component').then(m => m.RegistroComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'publicaciones',
        loadComponent: () => import('./features/posts/posts-page/posts-page.component').then(m => m.PostsPageComponent),
      },
      {
        path: 'publicaciones/:id',
        loadComponent: () => import('./features/posts/post-detail/post-detail.component').then(m => m.PostDetailComponent),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/profile/my-profile/my-profile.component').then(m => m.MyProfileComponent),
      },
      {
        path: 'admin/usuarios',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent),
      },
      {
        path: 'admin/estadisticas',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/admin-stats/admin-stats.component').then(m => m.AdminStatsComponent),
      },
    ],
  },
  { path: '', redirectTo: 'loading', pathMatch: 'full' },
  { path: '**', redirectTo: 'loading' },
];
