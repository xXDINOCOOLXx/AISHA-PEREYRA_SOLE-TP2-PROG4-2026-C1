import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { User, PerfilUsuario } from '../../../core/models/user.model';
import { UsersService } from '../../../core/services/users.service';
import { RoleLabelPipe } from '../../../shared/pipes/role-label.pipe';
import { HighlightDirective } from '../../../shared/directives/highlight.directive';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const repeat = control.get('repeatPassword')?.value;
  if (!password || !repeat) {
    return null;
  }
  return password === repeat ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    RoleLabelPipe,
    HighlightDirective,
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
})
export class AdminUsersComponent implements OnInit {
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  users: User[] = [];
  search = '';
  showForm = false;
  imagenFile: File | null = null;

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
      perfil: ['usuario' as PerfilUsuario, Validators.required],
    },
    { validators: passwordMatch },
  );

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersService.listar().subscribe((users) => (this.users = users));
  }

  get filteredUsers(): User[] {
    const term = this.search.toLowerCase();
    if (!term) return this.users;
    return this.users.filter(
      (u) =>
        u.nombre.toLowerCase().includes(term) ||
        u.apellido.toLowerCase().includes(term) ||
        u.correo.toLowerCase().includes(term) ||
        u.nombreUsuario.toLowerCase().includes(term),
    );
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imagenFile = input.files?.[0] || null;
  }

  createUser(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const fd = new FormData();
    Object.entries(v).forEach(([key, val]) => {
      if (key !== 'repeatPassword' && val != null) {
        fd.append(key, val as string);
      }
    });
    if (this.imagenFile) fd.append('imagenPerfil', this.imagenFile);

    this.usersService.crear(fd).subscribe({
      next: () => {
        this.snackBar.open('Usuario creado', 'Cerrar', { duration: 3000 });
        this.form.reset({ perfil: 'usuario' });
        this.showForm = false;
        this.loadUsers();
      },
      error: (err) => {
        const msg = err.error?.message?.[0] || 'Error al crear usuario';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
      },
    });
  }

  toggleUser(user: User): void {
    const action = user.activo ? 'deshabilitar' : 'reactivar';
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} usuario`,
        message: `¿Confirmás ${action} a ${user.nombre} ${user.apellido}?`,
        confirmText: 'Confirmar',
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      const req = user.activo
        ? this.usersService.deshabilitar(user.id)
        : this.usersService.reactivar(user.id);
      req.subscribe({
        next: () => {
          this.snackBar.open(`Usuario ${action}do`, 'Cerrar', { duration: 3000 });
          this.loadUsers();
        },
      });
    });
  }
}
