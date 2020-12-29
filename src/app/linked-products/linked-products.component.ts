import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { LinkedProductDto } from '../shared/dtos/linked-product.dto';
import { ProductService } from '../shared/services/product.service';
import { ProductItemWithSortOrder } from '../product-item-sorter/product-item-with-sort-order';
import { NotyService } from '../noty/noty.service';
import { finalize } from 'rxjs/operators';
import { ProductListItemDto } from '../shared/dtos/product.dto';
import { ISelectedProduct, ProductSelectorComponent } from '../product-selector/product-selector.component';
import { IDraggedEvent } from '../shared/directives/draggable-item/draggable-item.directive';
import { EReorderPosition } from '../shared/enums/reorder-position.enum';

@Component({
  selector: 'linked-products',
  templateUrl: './linked-products.component.html',
  styleUrls: ['./linked-products.component.scss']
})
export class LinkedProductsComponent implements OnInit {

  isLoading: boolean = false;
  productsWithSortOrder: ProductItemWithSortOrder[] = [];

  @Input() type: string;
  @Input('products') linkedProducts: LinkedProductDto[];
  @Output() onChange = new EventEmitter<LinkedProductDto[]>();
  @ViewChild(ProductSelectorComponent) selectorCmp: ProductSelectorComponent;

  constructor(
    private productService: ProductService,
    private notyService: NotyService
  ) { }

  ngOnInit(): void {
    this.fetchListItems();
  }

  private fetchListItems() {
    if (!this.linkedProducts.length) { return; }

    this.isLoading = true;
    this.productService.fetchProducts(this.getFetchParams(), false)
      .pipe( this.notyService.attachNoty(), finalize(() => this.isLoading = false) )
      .subscribe(
        response => {
          this.productsWithSortOrder = this.transformProducts(response.data);
          this.productsWithSortOrder.sort((a, b) => b.sortOrder - a.sortOrder);
        }
      );
  }

  private getFetchParams() {
    return {
      filters: [{ fieldName: 'id', value: this.linkedProducts.map(p => p.productId).join('|') }],
      limit: 1000
    };
  }

  private transformProducts(items: ProductListItemDto[]): ProductItemWithSortOrder[] {
    return items.map(item => {
      const linked = this.linkedProducts.find(p => p.productId === item.id);
      return {
        ...item,
        sortOrder: linked.sortOrder,
        isSortOrderFixed: false
      };
    });
  }

  addNewProduct() {
    this.selectorCmp.showSelector();
  }

  onProductSelect(evt: ISelectedProduct) {
    const sortOrder = 0;
    this.linkedProducts.push({ productId: evt.product.id, variantId: evt.variant.id, sortOrder });
    this.productsWithSortOrder.push({
      ...evt.product,
      sortOrder,
      isSortOrderFixed: false
    });
  }

  onReorder(evt: IDraggedEvent<ProductItemWithSortOrder>) {
    let newSortOrder: number;
    if (evt.position === EReorderPosition.Start) {
      newSortOrder = evt.targetItem.sortOrder + 1;
    } else {
      newSortOrder = evt.targetItem.sortOrder;
    }

    // Bump sort orders in linked products and in ProductSelectorComponent
    const productsToBump = [...this.linkedProducts, ...this.productsWithSortOrder].filter(product => {
      if (evt.position === EReorderPosition.Start) {
        return product.sortOrder > evt.targetItem.sortOrder;
      } else {
        return product.sortOrder >= evt.targetItem.sortOrder;
      }
    });
    productsToBump.forEach(product => product.sortOrder += 1);

    // Set new sort order in linked product and in ProductSelectorComponent's product
    const linkedProduct = this.linkedProducts.find(linkedProduct => linkedProduct.productId === evt.item.id);
    linkedProduct.sortOrder = newSortOrder;
    evt.item.sortOrder = newSortOrder;

    this.productsWithSortOrder.sort((a, b) => b.sortOrder - a.sortOrder);

    this.onChange.emit(this.linkedProducts);
  }

  onRemove(item: ProductItemWithSortOrder) {
    // Remove from linked products and from ProductSelectorComponent's products
    const idxInProductsWithSortOrder = this.productsWithSortOrder.findIndex(product => product.id === item.id);
    this.productsWithSortOrder.splice(idxInProductsWithSortOrder, 1);

    const idxInLinked = this.linkedProducts.findIndex(linked => linked.productId === item.id);
    this.linkedProducts.splice(idxInLinked, 1);

    this.onChange.emit(this.linkedProducts);
  }
}
