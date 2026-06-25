import { Directive, ElementRef, Input, OnChanges, inject } from '@angular/core';

@Directive({ selector: '[appHighlight]', standalone: true })
export class HighlightDirective implements OnChanges {
  private el = inject(ElementRef<HTMLElement>);

  @Input() appHighlight = '';
  @Input() highlightText = '';

  ngOnChanges(): void {
    const text = this.appHighlight;
    const term = this.highlightText?.trim();
    if (!text || !term) {
      this.el.nativeElement.textContent = text;
      return;
    }
    const regex = new RegExp(`(${term})`, 'gi');
    this.el.nativeElement.innerHTML = text.replace(
      regex,
      '<mark>$1</mark>',
    );
  }
}
