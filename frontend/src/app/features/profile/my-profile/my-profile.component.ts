import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PostsService } from '../../../core/services/posts.service';
import { CommentsService } from '../../../core/services/comments.service';
import { Post, Comment } from '../../../core/models/post.model';
import { PostCardComponent } from '../../posts/post-card/post-card.component';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    PostCardComponent,
    TimeAgoPipe,
  ],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss',
})
export class MyProfileComponent implements OnInit {
  auth = inject(AuthService);
  private postsService = inject(PostsService);
  private commentsService = inject(CommentsService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  posts: Post[] = [];
  postComments: Record<string, Comment[]> = {};
  editing = false;
  imagenFile: File | null = null;

  form = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', Validators.required],
    fechaNacimiento: ['', Validators.required],
    descripcion: ['', Validators.required],
  });

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user) return;
    this.form.patchValue({
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      nombreUsuario: user.nombreUsuario,
      fechaNacimiento: user.fechaNacimiento?.slice(0, 10),
      descripcion: user.descripcion,
    });
    this.loadPosts(user.id);
  }

  loadPosts(userId: string): void {
    this.postsService
      .listar({ userId, limit: 3, offset: 0 })
      .subscribe((page) => {
        this.posts = page.items;
        this.posts.forEach((post) => {
          this.commentsService.listar(post.id, 0, 3).subscribe((res) => {
            this.postComments[post.id] = res.items;
          });
        });
      });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imagenFile = input.files?.[0] || null;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const fd = new FormData();
    fd.append('nombre', v.nombre!);
    fd.append('apellido', v.apellido!);
    fd.append('correo', v.correo!);
    fd.append('nombreUsuario', v.nombreUsuario!);
    fd.append('fechaNacimiento', v.fechaNacimiento!);
    fd.append('descripcion', v.descripcion!);
    if (this.imagenFile) fd.append('imagenPerfil', this.imagenFile);

    this.auth.actualizarPerfil(fd).subscribe({
      next: () => {
        this.editing = false;
        this.snackBar.open('Perfil actualizado', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        const msg = err.error?.message?.[0] || 'Error al actualizar';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
      },
    });
  }
}
