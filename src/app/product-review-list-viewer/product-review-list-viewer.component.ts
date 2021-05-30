import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { IGridCell, IGridValue } from '../grid/grid.interface';
import { DEFAULT_CURRENCY_CODE } from '../shared/enums/currency.enum';
import { GridComponent } from '../grid/grid.component';
import { ActivatedRoute } from '@angular/router';
import { NotyService } from '../noty/noty.service';
import { finalize } from 'rxjs/operators';
import { DEFAULT_LANG } from '../shared/constants/constants';
import { ProductReviewDto } from '../shared/dtos/product-review.dto';
import { ProductReviewService } from '../shared/services/product-review.service';
import { getPropertyOf } from '../shared/helpers/get-property-of.function';
import { ReviewSource } from '../shared/enums/review-source.enum';

@Component({
  selector: 'product-review-list-viewer',
  templateUrl: './product-review-list-viewer.component.html',
  styleUrls: ['./product-review-list-viewer.component.scss']
})
export class ProductReviewListViewerComponent implements OnInit, AfterViewInit {

  itemsTotal: number = 0;
  itemsFiltered: number;
  pagesTotal: number = 1;
  isGridLoading: boolean = false;
  lang = DEFAULT_LANG;
  reviewSourceEnum = ReviewSource;

  gridCells: IGridCell[] = productReviewsGridCells;
  productReviews: ProductReviewDto[] = [];

  private fetchAllSub: Subscription;

  @Input() ids: number[];
  @ViewChild(GridComponent) gridCmp: GridComponent;

  constructor(
    private productReviewService: ProductReviewService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private notyService: NotyService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    if (!this.ids?.length) { return; }

    const gridValue = this.gridCmp.getValue();
    this.fetchProductReviews(gridValue);
  }

  fetchProductReviews(gridValue: IGridValue) {
    if (this.fetchAllSub) { this.fetchAllSub.unsubscribe(); }

    gridValue.filters.push({ fieldName: 'id', value: this.ids.join('|') })

    this.isGridLoading = true;
    this.cdr.detectChanges();
    this.fetchAllSub = this.productReviewService.fetchAllProductReviews(gridValue)
      .pipe(this.notyService.attachNoty(), finalize(() => this.isGridLoading = false))
      .subscribe(
        response => {
          this.productReviews = response.data;
          this.itemsTotal = response.itemsTotal;
          this.itemsFiltered = response.itemsFiltered;
          this.pagesTotal = response.pagesTotal;
        },
        error => console.warn(error)
      );
  }
}

const productReviewsGridCells: IGridCell[] = [
  {
    isSearchable: false,
    label: 'Дата',
    initialWidth: 100,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<ProductReviewDto>('createdAt')
  },
  {
    isSearchable: true,
    label: 'ID товара',
    initialWidth: 60,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<ProductReviewDto>('productId')
  },
  {
    isSearchable: true,
    label: 'Название товара',
    initialWidth: 250,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<ProductReviewDto>('productName')
  },
  {
    isSearchable: true,
    label: 'Имя',
    initialWidth: 100,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: getPropertyOf<ProductReviewDto>('name')
  },
  {
    isSearchable: true,
    label: 'Текст',
    initialWidth: 350,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: getPropertyOf<ProductReviewDto>('text')
  },
  {
    isSearchable: true,
    label: 'Оценка',
    initialWidth: 70,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<ProductReviewDto>('rating')
  },
  {
    isSearchable: false,
    label: 'Статус',
    initialWidth: 100,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<ProductReviewDto>('isEnabled')
  },
  {
    isSearchable: true,
    label: 'Ответ менеджера',
    initialWidth: 300,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: getPropertyOf<ProductReviewDto>('managerComment')
  },
  {
    isSearchable: false,
    label: 'Источник',
    initialWidth: 105,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<ProductReviewDto>('source'),
    filterFields: [
      { value: ReviewSource.Manager, view: 'Менеджер' },
      { value: ReviewSource.Website, view: 'Сайт' },
      { value: ReviewSource.Email, view: 'Письмо' },
      { value: ReviewSource.LinkFromEmail, view: 'Ссылка из письма' },
      { value: ReviewSource.Sms, view: 'Sms' },
    ]
  }
];
