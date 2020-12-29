import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProductItemWithSortOrder } from './product-item-with-sort-order';
import { IDraggedEvent } from '../shared/directives/draggable-item/draggable-item.directive';
import { DEFAULT_LANG, UPLOADED_HOST } from '../shared/constants/constants';
import { ProductListItemDto } from '../shared/dtos/product.dto';

@Component({
  selector: 'product-item-sorter',
  templateUrl: './product-item-sorter.component.html',
  styleUrls: ['./product-item-sorter.component.scss']
})
export class ProductItemSorterComponent implements OnInit {

  lang = DEFAULT_LANG;

  @Input() isLoading: boolean = false;
  @Input() items: ProductItemWithSortOrder[];
  @Input() itemsType = 'product';
  @Input() hasRemoveBtn: boolean = false;
  @Output() reorder = new EventEmitter<IDraggedEvent<ProductItemWithSortOrder>>();
  @Output() remove = new EventEmitter<ProductItemWithSortOrder>();
  @Output() unfix = new EventEmitter<ProductItemWithSortOrder>();

  constructor() { }

  ngOnInit(): void {
  }

  onReorder(event: IDraggedEvent) {
    this.reorder.emit(event);
  }

  onRemove(item: ProductItemWithSortOrder) {
    if (!confirm(`Вы точно хотите убрать товар с id "${item.id}" из этого списка?`)) { return; }

    this.remove.emit(item);
  }

  setItemThumbnail(product: ProductListItemDto) {
    if (!product.mediaUrl) {
      return 'admin/assets/images/no-img.png';
    } else {
      return UPLOADED_HOST + product.mediaUrl;
    }
  }

  onSortClick(product: ProductItemWithSortOrder) {
    if (product.isSortOrderFixed) {
      this.unfix.emit(product);
    }
  }
}
