import { Directive, ElementRef, inject, AfterViewInit } from '@angular/core';

@Directive({ selector: '[appAutoFocus]', standalone: true })
export class AutoFocusDirective implements AfterViewInit {
  private el = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    setTimeout(() => this.el.nativeElement.focus(), 0);
  }
}
