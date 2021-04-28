import { Directive, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[ngUnsubscribe]'
})
export class NgUnsubscribe implements OnDestroy {

  protected ngUnsubscribe = new Subject();

  constructor() { }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  protected takeUntilDestroy<T>() {
    return takeUntil<T>(this.ngUnsubscribe);
  }

}
