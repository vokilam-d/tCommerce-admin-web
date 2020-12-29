import { AfterViewInit, Directive, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[autofocus]'
})
export class AutofocusDirective implements AfterViewInit {

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: any
  ) { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.elementRef.nativeElement.focus());
    }
  }
}
