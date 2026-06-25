import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loading = false;

  form = this.fb.group({
    identificador: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { identificador, password } = this.form.getRawValue();
    this.auth.login(identificador!, password!).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('¡Bienvenido!', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        this.loading = false;
        const msg =
          err.error?.message?.[0] || 'Credenciales inválidas';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
      },
    });
  }
}
