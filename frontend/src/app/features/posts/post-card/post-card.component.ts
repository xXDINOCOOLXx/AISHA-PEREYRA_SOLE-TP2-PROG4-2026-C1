import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Post } from '../../../core/models/post.model';
import { PostsService } from '../../../core/services/posts.service';
import { AuthService } from '../../../core/services/auth.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [RouterLink, TimeAgoPipe, TruncatePipe],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.scss',
})
export class PostCardComponent {
  @Input({ required: true }) post!: Post;
  @Output() changed = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();
  @Input() fullContent = false;
  
  private postsService = inject(PostsService);
  auth = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  get canDelete(): boolean {
    const user = this.auth.currentUser();
    if (!user) return false;
    return (
      this.post.autor.id === user.id || user.perfil === 'administrador'
    );
  }

  toggleLike(): void {
    const action = this.post.likedByMe
      ? this.postsService.quitarLike(this.post.id)
      : this.postsService.darLike(this.post.id);
    action.subscribe({
      next: (updated) => {
        this.post = updated;
        this.changed.emit();
      },
      error: () =>
        this.snackBar.open('No se pudo actualizar el like', 'Cerrar', {
          duration: 3000,
        }),
    });
  }

  deletePost(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar publicación',
        message: '¿Estás seguro de que querés eliminar esta publicación?',
        confirmText: 'Eliminar',
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.postsService.eliminar(this.post.id).subscribe({
        next: () => {
          this.snackBar.open('Publicación eliminada', 'Cerrar', {
            duration: 3000,
          });
          this.deleted.emit();
        },
        error: () =>
          this.snackBar.open('No se pudo eliminar', 'Cerrar', {
            duration: 3000,
          }),
      });
    });
  }

  imageUrl(path: string): string {
    return this.postsService.imageUrl(path);
  }
}
