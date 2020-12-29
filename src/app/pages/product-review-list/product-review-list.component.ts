import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotyService } from '../../noty/noty.service';
import { ProductReviewDto } from '../../shared/dtos/product-review.dto';
import { ProductReviewService } from '../../shared/services/product-review.service';
import { IGridCell, IGridValue } from '../../grid/grid.interface';
import { getPropertyOf } from '../../shared/helpers/get-property-of.function';
import { Subscription } from 'rxjs';
import { GridComponent } from '../../grid/grid.component';
import { finalize } from 'rxjs/operators';
import { HeadService } from '../../shared/services/head.service';

@Component({
  selector: 'product-review-list',
  templateUrl: './product-review-list.component.html',
  styleUrls: ['./product-review-list.component.scss']
})
export class ProductReviewListComponent implements OnInit, AfterViewInit {

  private fetchAllSub: Subscription;

  productReviews: ProductReviewDto[] = [];
  itemsTotal: number = 0;
  itemsFiltered: number;
  pagesTotal: number = 1;
  isGridLoading: boolean = false;
  idFieldName = getPropertyOf<ProductReviewDto>('id');
  gridCells: IGridCell[] = storeReviewsGridCells;

  @ViewChild(GridComponent) gridCmp: GridComponent;

  constructor(
    private productReviewsService: ProductReviewService,
    private route: ActivatedRoute,
    private headService: HeadService,
    private cdr: ChangeDetectorRef,
    private notyService: NotyService,
    private router: Router
  ) { }

  ngOnInit() {
    this.headService.setTitle(`Отзывы о товарах`);
  }

  ngAfterViewInit(): void {
    const gridValue = this.gridCmp.getValue();
    this.fetchProductReviews(gridValue);
  }

  add() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  fetchProductReviews(gridValue: IGridValue) {
    if (this.fetchAllSub) { this.fetchAllSub.unsubscribe(); }

    this.isGridLoading = true;
    this.cdr.detectChanges();
    this.fetchAllSub = this.productReviewsService.fetchAllProductReviews(gridValue)
      .pipe(this.notyService.attachNoty(), finalize(() => this.isGridLoading = false))
      .subscribe(
        response => {
          this.productReviews = response.data;
          this.itemsTotal = response.itemsTotal;
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
  }
];
