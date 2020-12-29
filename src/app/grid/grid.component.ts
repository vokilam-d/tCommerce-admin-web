import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { IGridCell, IGridFilter, IGridValue } from './grid.interface';
import { PaginationComponent } from '../pagination/pagination.component';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { NgUnsubscribe } from '../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DeviceService } from '../shared/services/device-detector/device.service';


type fieldName = string;

interface IGridSorting {
  fieldName: fieldName;
  isDescOrder: boolean;
}

interface ISavedGridInfo {
  sorting?: IGridSorting;
  filtersMapAsObj?: { [fieldName: string]: string };
}

@Component({
  selector: 'grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('blockInitialAnimation', [transition(':enter', [])]),
    trigger('slideToggle', [
      state('true', style({ 'height': '*', 'padding': '*' })),
      state('false', style({ 'height': 0, 'overflow': 'hidden', 'padding': 0, 'margin': 0, 'border-color': 'transparent' })),
      transition('* <=> *', animate('0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'))
    ])
  ]
})
export class GridComponent<T extends { isOpened?: boolean } = any> extends NgUnsubscribe implements OnInit, AfterViewInit {

  activeSorting: IGridSorting = null;
  filtersMap = new Map<fieldName, string | string[]>();
  gridScrollLeft: number = 0;

  private search$ = new Subject<IGridFilter>();

  @Input() gridName: string;
  @Input() cells: IGridCell[] = [];
  @Input() itemsArray: T[] = [];
  @Input() isLoading: boolean = false;
  @Input() size: 'default' | 'small' = 'default';
  @Input() linkUrlSuffix: string;
  @Input() linkFieldName: string;
  @Input() linkTarget: '_self' | '_blank' = '_self';
  @Input() subItemsFieldName: string;
  @Input() trackByFieldName: string;
  @Input() pagesTotal: number;
  @Input() itemsFiltered: number;
  @Output('gridChange') changeEmitter = new EventEmitter<IGridValue>();
  @Output('itemSelect') itemSelectEmitter = new EventEmitter<T>();

  @ViewChild(PaginationComponent) paginationCmp: PaginationComponent;
  @ViewChild('gridBodyRef') gridBodyRef: ElementRef<HTMLElement>;
  @ContentChildren('cellContent') cellContents: QueryList<TemplateRef<any>>;
  @ContentChildren('subCellContent') subCellContents: QueryList<TemplateRef<any>>;

  get cellContentsArray(): TemplateRef<any>[] { return this.cellContents.toArray(); }
  get subCellContentsArray(): TemplateRef<any>[] { return this.subCellContents.toArray(); }

  constructor(
    private deviceService: DeviceService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this.setFromSavedInfo();
    this.handleSearch();
  }

  ngAfterViewInit() {
    this.handleHeadFixed();
  }

  onHeadCellClick(cell: IGridCell) {
    if (!cell.isSortable) { return; }

    if (this.activeSorting && this.activeSorting.fieldName === cell.fieldName) {
      this.activeSorting.isDescOrder = !this.activeSorting.isDescOrder;
    } else {
      this.activeSorting = { fieldName: cell.fieldName, isDescOrder: true };
    }

    this.emitChange();
  }

  emitChange() {
    this.changeEmitter.emit(this.getValue());
    this.saveInfo();
  }

  getValue(): IGridValue {
    const gridValue: IGridValue = {
      ...this.paginationCmp.getValue(),
      filters: []
    };
    this.filtersMap.forEach((value, key) => gridValue.filters.push({ fieldName: key, value }));


    if (this.activeSorting) {
      gridValue.sort = this.activeSorting.fieldName;

      if (this.activeSorting.isDescOrder) {
        gridValue.sort = '-' + gridValue.sort;
      }
    }

    return gridValue;
  }

  onSearchInput(cell: IGridCell, evt: Event) {
    const value = (evt.target as HTMLInputElement).value;
    this.search$.next({ fieldName: cell.fieldName, value })
  }

  onFilterSelect(cell: IGridCell, data: any) {
    this.search$.next({ fieldName: cell.fieldName, value: data })
  }

  onDateSelect(cell: IGridCell, event: Event, range: 'from' | 'to') {
    const date: string = (event.target as HTMLInputElement).value;
    const selectedDateRange = this.filtersMap.get(cell.fieldName) as string[] || [];

    const rangeIdx = range === 'from' ? 0 : 1;
    selectedDateRange[rangeIdx] = date;

    this.search$.next({ fieldName: cell.fieldName, value: selectedDateRange });
  }

  getRouterLinkUrl(item: T): string[] | null {
    if (!this.linkUrlSuffix || !this.linkFieldName) {
      return null;
    }

    return [this.linkUrlSuffix, item[this.linkFieldName]];
  }

  onItemSelect(item: T) {
    this.itemSelectEmitter.emit(item);
  }

  trackBy(index: number, item: T) {
    return this.trackByFieldName ? item[this.trackByFieldName] : index;
  }

  private setFromSavedInfo() {
    const savedInfo = this.getSavedInfo();
    if (!savedInfo) { return; }

    if (savedInfo.sorting) {
      this.activeSorting = savedInfo.sorting;
    }
    if (savedInfo.filtersMapAsObj) {
      Object.keys(savedInfo.filtersMapAsObj).forEach(key => {
        this.filtersMap.set(key, savedInfo.filtersMapAsObj[key]);
      });
    }
  }

  private getSavedInfo(): ISavedGridInfo | null {
    if (!this.gridName || this.deviceService.isPlatformServer()) {
      return null;
    }

    return JSON.parse(localStorage.getItem(`grid-info-${this.gridName}`));
  }

  private saveInfo() {
    if (!this.gridName || this.deviceService.isPlatformServer()) {
      return;
    }

    let filtersMap: any;
    if (this.filtersMap.size > 0) {
      filtersMap = { };
      this.filtersMap.forEach(((value, key) => filtersMap[key] = value));
    }

    const savedInfo: ISavedGridInfo = {
      sorting: this.activeSorting,
      filtersMapAsObj: filtersMap
    };
    localStorage.setItem(`grid-info-${this.gridName}`, JSON.stringify(savedInfo));
  }

  private handleSearch() {
    if (this.deviceService.isPlatformServer()) { return; }

    this.search$
      .pipe( takeUntil(this.ngUnsubscribe), debounceTime(400) )
      .subscribe(
        evt => {
          if (evt.value) {
            this.filtersMap.set(evt.fieldName, evt.value);
          } else {
            this.filtersMap.delete(evt.fieldName);
          }
          this.emitChange();
        }
      );
  }

  private handleHeadFixed() {
    if (this.deviceService.isPlatformServer()) { return; }

    fromEvent(this.gridBodyRef.nativeElement, 'scroll')
      .pipe( takeUntil(this.ngUnsubscribe) )
      .subscribe(evt => {
        this.gridScrollLeft = (evt.target as HTMLElement).scrollLeft;
        this.cdr.markForCheck();
      });
  }

  clearAllFilters() {
    this.filtersMap.clear();
    this.emitChange();
  }
}
