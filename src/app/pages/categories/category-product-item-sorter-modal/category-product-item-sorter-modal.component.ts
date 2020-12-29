import { Component, Input, OnInit } from '@angular/core';
import { ProductService } from '../../../shared/services/product.service';
import { NotyService } from '../../../noty/noty.service';
import { finalize } from 'rxjs/operators';
import { ProductCategoryDto, ProductListItemDto } from '../../../shared/dtos/product.dto';
import { IDraggedEvent } from '../../../shared/directives/draggable-item/draggable-item.directive';
import { ProductItemWithSortOrder } from '../../../product-item-sorter/product-item-with-sort-order';

@Component({
  selector: 'category-product-item-sorter-modal',
  templateUrl: './category-product-item-sorter-modal.component.html',
  styleUrls: ['./category-product-item-sorter-modal.component.scss']
})
export class CategoryProductItemSorterModalComponent implements OnInit {

  isModalVisible: boolean = false;
  isLoading: boolean = false;
  itemsWithSortOrder: ProductItemWithSortOrder[];

  @Input() categoryId: number;

  constructor(
    private productService: ProductService,
    private notyService: NotyService
  ) { }

  ngOnInit(): void {
  }

  openModal() {
    this.isModalVisible = true;
    this.fetchProducts();
  }

  closeModal() {
    this.isModalVisible = false;
    this.itemsWithSortOrder = [];
  }

  private fetchProducts() {
    this.isLoading = true;
    this.productService.fetchProducts(this.getFetchProductsParams(), false)
      .pipe(this.notyService.attachNoty(), finalize(() => this.isLoading = false))
      .subscribe(response => {
        this.itemsWithSortOrder = this.transformProducts(response.data);
      });
  }

  onReorder(draggedEvt: IDraggedEvent) {
    this.isLoading = true;

    this.productService.fixSortOrder(
      draggedEvt.item,
      draggedEvt.targetItem,
      draggedEvt.position,
      this.categoryId,
      this.getFetchProductsParams()
    )
      .pipe(this.notyService.attachNoty(), finalize(() => this.isLoading = false))
      .subscribe(
        response => {
          this.itemsWithSortOrder = this.transformProducts(response.data);
        },
        error => console.warn(error)
      );
  }

  onUnfix(item: ProductItemWithSortOrder) {
    if (!confirm(`Вы уверены, что хотите открепить сортировку этого товара?`)) {
      return;
    }

    this.isLoading = true;

    this.productService.unFixSortOrder(item, this.categoryId, this.getFetchProductsParams())
      .pipe(this.notyService.attachNoty(), finalize(() => this.isLoading = false))
      .subscribe(
        response => {
          this.itemsWithSortOrder = this.transformProducts(response.data);
        },
        error => console.warn(error)
      );
  }

  private getFetchProductsParams() {
    const categoriesProp: keyof ProductListItemDto = 'categories';
    const sortOrderProp: keyof ProductCategoryDto = 'reversedSortOrder';
    return {
      filters: [{ fieldName: `${categoriesProp}.id`, value: `${this.categoryId}` }],
      sort: `${categoriesProp}.${sortOrderProp}`,
      limit: 1000,
      page: 1
    };
  }

  private transformProducts(items: ProductListItemDto[]): ProductItemWithSortOrder[] {
    return items.map(item => {
      const foundCategory = item.categories.find(c => c.id === this.categoryId);
      return {
        ...item,
        sortOrder: foundCategory?.reversedSortOrder,
        isSortOrderFixed: foundCategory?.isSortOrderFixed,
      }
    });
  }
}
