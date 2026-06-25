import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  inject,
  effect,
} from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({ selector: '[appAdminOnly]', standalone: true })
export class AdminOnlyDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);
  private auth = inject(AuthService);

  constructor() {
    effect(() => {
      this.vcr.clear();
      if (this.auth.isAdmin()) {
        this.vcr.createEmbeddedView(this.templateRef);
      }
    });
  }
}
