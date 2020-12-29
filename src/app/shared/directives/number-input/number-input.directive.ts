import { Directive, ElementRef, HostListener, Input, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[numberInput]'
})
export class NumberInputDirective {

  @Input() max: number;
  @Input() min: number = 0;

  constructor(
    private element: ElementRef,
    @Optional() private ngControl: NgControl
  ) { }

  @HostListener('blur')
  onBlur() {
    const value = parseFloat(this.getValue());

    if (value > this.max) {
      this.setValue(this.max);
    } else if (value < this.min || isNaN(value)) {
      this.setValue(this.min);
    }
  }

  private getValue() {
    if (this.ngControl) {
      return this.ngControl.control.value;
    } else {
      return this.element.nativeElement.value;
    }
  }

  private setValue(value: number) {
    if (this.ngControl) {
      this.ngControl.control.setValue(value);
    } else {
      this.element.nativeElement.value = value;
    }
  }
}
