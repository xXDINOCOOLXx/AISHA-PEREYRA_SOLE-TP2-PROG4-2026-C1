import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Post, Comment } from '../../../core/models/post.model';
import { PostsService } from '../../../core/services/posts.service';
import { CommentsService } from '../../../core/services/comments.service';
import { AuthService } from '../../../core/services/auth.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { AutoFocusDirective } from '../../../shared/directives/auto-focus.directive';
import { PostCardComponent } from '../post-card/post-card.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    TimeAgoPipe,
    AutoFocusDirective,
    PostCardComponent,
  ],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss',
})
export class PostDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postsService = inject(PostsService);
  private commentsService = inject(CommentsService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  auth = inject(AuthService);

  post: Post | null = null;
  comments: Comment[] = [];
  commentsTotal = 0;
  commentsOffset = 0;
  commentsLimit = 5;
  editingId: string | null = null;

  commentForm = this.fb.group({
    mensaje: ['', Validators.required],
  });

  editForm = this.fb.group({
    mensaje: ['', Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadPost(id);
    this.loadComments(id, true);
  }

  loadPost(id: string): void {
    this.postsService.obtener(id).subscribe({
      next: (post) => (this.post = post),
      error: () =>
        this.snackBar.open('Publicación no encontrada', 'Cerrar', {
          duration: 3000,
        }),
    });
  }

  loadComments(postId: string, reset = false): void {
    if (reset) {
      this.commentsOffset = 0;
      this.comments = [];
    }
    this.commentsService
      .listar(postId, this.commentsOffset, this.commentsLimit)
      .subscribe({
        next: (page) => {
          this.comments = reset
            ? page.items
            : [...this.comments, ...page.items];
          this.commentsTotal = page.total;
        },
      });
  }

  loadMoreComments(): void {
    if (!this.post) return;
    this.commentsOffset += this.commentsLimit;
    this.loadComments(this.post.id);
  }

  get hasMoreComments(): boolean {
    return this.comments.length < this.commentsTotal;
  }

  submitComment(): void {
    if (!this.post || this.commentForm.invalid) return;
    const mensaje = this.commentForm.get('mensaje')!.value!;
    this.commentsService.crear(this.post.id, mensaje).subscribe({
      next: (comment) => {
        this.comments = [comment, ...this.comments];
        this.commentsTotal++;
        this.commentForm.reset();
        this.snackBar.open('Comentario publicado', 'Cerrar', { duration: 3000 });
      },
    });
  }

  startEdit(comment: Comment): void {
    this.editingId = comment.id;
    this.editForm.patchValue({ mensaje: comment.mensaje });
  }

  saveEdit(commentId: string): void {
    if (this.editForm.invalid) return;
    const mensaje = this.editForm.get('mensaje')!.value!;
    this.commentsService.editar(commentId, mensaje).subscribe({
      next: (updated) => {
        this.comments = this.comments.map((c) =>
          c.id === commentId ? updated : c,
        );
        this.editingId = null;
        this.snackBar.open('Comentario actualizado', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  imageUrl(path: string): string {
    return this.postsService.imageUrl(path);
  }
}
