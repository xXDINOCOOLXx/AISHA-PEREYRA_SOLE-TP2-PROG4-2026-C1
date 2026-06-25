import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const repeat = control.get('repeatPassword')?.value;
  return password === repeat ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss',
})
export class RegistroComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loading = false;
  imagenFile: File | null = null;
  imagenError = '';

  form = this.fb.group(
    {
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/[A-Z]/),
          Validators.pattern(/[0-9]/),
        ],
      ],
      repeatPassword: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      descripcion: ['', Validators.required],
    },
    { validators: passwordMatch },
  );

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imagenFile = input.files?.[0] || null;
    this.imagenError = '';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.imagenFile) {
      this.imagenError = 'La imagen de perfil es obligatoria';
      return;
    }
    this.loading = true;
    const v = this.form.getRawValue();
    const fd = new FormData();
    fd.append('nombre', v.nombre!);
    fd.append('apellido', v.apellido!);
    fd.append('correo', v.correo!);
    fd.append('nombreUsuario', v.nombreUsuario!);
    fd.append('password', v.password!);
    fd.append('fechaNacimiento', v.fechaNacimiento!);
    fd.append('descripcion', v.descripcion!);
    fd.append('imagenPerfil', this.imagenFile);

    this.auth.registro(fd).subscribe({
      next: () => {
        this.snackBar.open('Registro exitoso', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message?.[0] || 'Error al registrarse';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
      },
    });
  }
}
