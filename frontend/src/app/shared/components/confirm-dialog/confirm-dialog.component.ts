import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close(false)">Cancelar</button>
      <button mat-flat-button color="warn" (click)="close(true)">
        {{ data.confirmText || 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  data = inject<{ title: string; message: string; confirmText?: string }>(
    MAT_DIALOG_DATA,
  );
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  close(confirmed: boolean): void {
    this.dialogRef.close(confirmed);
  }
}
