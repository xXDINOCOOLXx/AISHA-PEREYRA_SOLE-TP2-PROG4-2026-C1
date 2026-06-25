import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-session-extend-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Sesión por vencer</h2>
    <mat-dialog-content>
      <p>Quedan 5 minutos de sesión. ¿Desea extenderla?</p>
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

  authService = inject(AuthService);

  close(extend: boolean): void {
    this.dialogRef.close(extend);
    this.authService.logout();
  }
}
