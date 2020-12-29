import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { IPagination } from './pagination.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ISelectOption } from '../shared/components/select/select-option.interface';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit, OnDestroy {

  limitOptions: ISelectOption[] = [{ data: 25 }, { data: 50 }, { data: 100 }, { data: 200 }, { data: 1000 }];

  private form: FormGroup;
  private ngUnsubscribe = new Subject();
  private get storageKey(): string { return `limit_${this.dataType}`; }

  @Input() dataType: string = 'default';
  @Input() pageCount: IPagination['pageCount'] = 1;
  @Output('change') changeEmitter = new EventEmitter<IPagination>();

  get limitControl() { return this.form.get('limit'); }
  get pageControl() { return this.form.get('page'); }

  constructor(
    private formBuilder: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: any
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      limit: this.getInitialLimit(),
      page: 1
    });

    this.form.valueChanges
      .pipe( takeUntil(this.ngUnsubscribe) )
      .subscribe(value => {
        this.changeEmitter.emit(value);
        this.saveLimit(value.limit);
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private getInitialLimit(): number {
    if (!isPlatformBrowser(this.platformId)) { return; }

    return JSON.parse(localStorage.getItem(this.storageKey)) || 50;
  }

  private saveLimit(limit: number) {
    if (!isPlatformBrowser(this.platformId)) { return; }

    localStorage.setItem(this.storageKey, limit.toString());
  }

  prevPage() {
    const page = this.form.get('page').value;
    if (page <= 1) {
      return;
    }

    this.pageControl.patchValue(page - 1);
  }

  nextPage() {
    const page = this.form.get('page').value;
    if (page >= this.pageCount) {
      return;
    }

    this.pageControl.patchValue(page + 1);
  }

  getValue(): IPagination {
    return this.form.value;
  }
}
