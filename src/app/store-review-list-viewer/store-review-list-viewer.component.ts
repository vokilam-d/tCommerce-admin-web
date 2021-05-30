import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { IGridCell, IGridValue } from '../grid/grid.interface';
import { GridComponent } from '../grid/grid.component';
import { ActivatedRoute } from '@angular/router';
import { NotyService } from '../noty/noty.service';
import { finalize } from 'rxjs/operators';
import { DEFAULT_LANG } from '../shared/constants/constants';
import { StoreReviewDto } from '../shared/dtos/store-review.dto';
import { StoreReviewService } from '../shared/services/store-review.service';
import { getPropertyOf } from '../shared/helpers/get-property-of.function';
import { ReviewSource } from '../shared/enums/review-source.enum';

@Component({
  selector: 'store-review-list-viewer',
  templateUrl: './store-review-list-viewer.component.html',
  styleUrls: ['./store-review-list-viewer.component.scss']
})
export class StoreReviewListViewerComponent implements OnInit, AfterViewInit {

  itemsTotal: number = 0;
  itemsFiltered: number;
  pagesTotal: number = 1;
  isGridLoading: boolean = false;
  lang = DEFAULT_LANG;
  reviewSourceEnum = ReviewSource;

  gridCells: IGridCell[] = storeReviewsGridCells;
  storeReviews: StoreReviewDto[] = [];

  private fetchAllSub: Subscription;

  @Input() ids: number[];
  @ViewChild(GridComponent) gridCmp: GridComponent;

  constructor(
    private storeReviewService: StoreReviewService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private notyService: NotyService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    if (!this.ids?.length) { return; }

    const gridValue = this.gridCmp.getValue();
    this.fetchStoreReviews(gridValue);
  }

  fetchStoreReviews(gridValue: IGridValue) {
    if (this.fetchAllSub) { this.fetchAllSub.unsubscribe(); }

    gridValue.filters.push({ fieldName: 'id', value: this.ids.join('|') })

    this.isGridLoading = true;
    this.cdr.detectChanges();
    this.fetchAllSub = this.storeReviewService.fetchAllStoreReviews(gridValue)
      .pipe(this.notyService.attachNoty(), finalize(() => this.isGridLoading = false))
      .subscribe(
        response => {
          this.storeReviews = response.data;
          this.itemsTotal = response.itemsTotal;
          this.itemsFiltered = response.itemsFiltered;
          this.pagesTotal = response.pagesTotal;
        },
        error => console.warn(error)
      );
  }
}

const storeReviewsGridCells: IGridCell[] = [
  {
    isSearchable: false,
    label: 'Дата',
    initialWidth: 100,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<StoreReviewDto>('createdAt')
  },
  {
    isSearchable: true,
    label: 'Имя',
    initialWidth: 100,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: getPropertyOf<StoreReviewDto>('name')
  },
  {
    isSearchable: true,
    label: 'Текст',
    initialWidth: 300,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: getPropertyOf<StoreReviewDto>('text')
  },
  {
    isSearchable: true,
    label: 'Оценка',
    initialWidth: 70,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<StoreReviewDto>('rating')
  },
  {
    isSearchable: false,
    label: 'Статус',
    initialWidth: 100,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<StoreReviewDto>('isEnabled')
  },
  {
    isSearchable: true,
    label: 'Ответ менеджера',
    initialWidth: 300,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: getPropertyOf<StoreReviewDto>('managerComment')
  },
  {
    isSearchable: false,
    label: 'Источник',
    initialWidth: 105,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<StoreReviewDto>('source'),
    filterFields: [
      { value: ReviewSource.Manager, view: 'Менеджер' },
      { value: ReviewSource.Website, view: 'Сайт' },
      { value: ReviewSource.Email, view: 'Письмо' },
      { value: ReviewSource.LinkFromEmail, view: 'Ссылка из письма' },
      { value: ReviewSource.Sms, view: 'Sms' },
    ]
  }
];
