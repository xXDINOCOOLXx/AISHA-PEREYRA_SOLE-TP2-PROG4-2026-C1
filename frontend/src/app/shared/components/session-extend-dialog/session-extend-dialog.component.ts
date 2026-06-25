import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-session-extend-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Sesión por vencer</h2>
    <mat-dialog-content>
      <p>Quedan 5 minutos de sesión. ¿Deseás extenderla?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close(false)">No, salir</button>
      <button mat-flat-button color="primary" (click)="close(true)">
        Sí, extender
      </button>
    </mat-dialog-actions>
  `,
})
export class SessionExtendDialogComponent {
  constructor(private dialogRef: MatDialogRef<SessionExtendDialogComponent>) {}

  close(extend: boolean): void {
    this.dialogRef.close(extend);
  }
}
