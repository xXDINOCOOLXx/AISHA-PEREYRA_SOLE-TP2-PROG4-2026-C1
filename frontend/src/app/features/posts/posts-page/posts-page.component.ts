import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Post } from '../../../core/models/post.model';
import { PostsService } from '../../../core/services/posts.service';
import { PostCardComponent } from '../post-card/post-card.component';

@Component({
  selector: 'app-posts-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    PostCardComponent,
  ],
  templateUrl: './posts-page.component.html',
  styleUrl: './posts-page.component.scss',
})
export class PostsPageComponent implements OnInit {
  private postsService = inject(PostsService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  posts: Post[] = [];
  total = 0;
  offset = 0;
  limit = 5;
  sort: 'fecha' | 'likes' = 'fecha';
  loading = false;
  showForm = false;
  imagenFile: File | null = null;

  createForm = this.fb.group({
    titulo: ['', Validators.required],
    mensaje: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(reset = false): void {
    if (reset) {
      this.offset = 0;
      this.posts = [];
    }
    this.loading = true;
    this.postsService
      .listar({ sort: this.sort, offset: this.offset, limit: this.limit })
      .subscribe({
        next: (page) => {
          this.posts = reset ? page.items : [...this.posts, ...page.items];
          this.total = page.total;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Error al cargar publicaciones', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }

  onSortChange(sort: 'fecha' | 'likes'): void {
    this.sort = sort;
    this.loadPosts(true);
  }

  loadMore(): void {
    if (this.offset + this.limit >= this.total) return;
    this.offset += this.limit;
    this.loadPosts();
  }

  get hasMore(): boolean {
    return this.offset + this.limit < this.total;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imagenFile = input.files?.[0] || null;
  }

  createPost(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const v = this.createForm.getRawValue();
    const fd = new FormData();
    fd.append('titulo', v.titulo!);
    fd.append('mensaje', v.mensaje!);
    if (this.imagenFile) fd.append('imagen', this.imagenFile);

    this.postsService.crear(fd).subscribe({
      next: () => {
        this.snackBar.open('Publicación creada', 'Cerrar', { duration: 3000 });
        this.createForm.reset();
        this.imagenFile = null;
        this.showForm = false;
        this.loadPosts(true);
      },
      error: (err) => {
        const msg = err.error?.message?.[0] || 'Error al crear la publicación';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
      },
    });
  }
}
