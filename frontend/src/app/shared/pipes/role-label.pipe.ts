import { Pipe, PipeTransform } from '@angular/core';
import { PerfilUsuario } from '../../core/models/user.model';

@Pipe({ name: 'roleLabel', standalone: true })
export class RoleLabelPipe implements PipeTransform {
  transform(value: PerfilUsuario): string {
    return value === 'administrador' ? 'Administrador' : 'Usuario';
  }
}
