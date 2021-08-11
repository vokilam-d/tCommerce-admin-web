import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { OrderItemDto } from '../shared/dtos/order-item.dto';
import { catchError, finalize, tap } from 'rxjs/operators';
import { ProductSelectorComponent } from '../product-selector/product-selector.component';
import { DEFAULT_LANG, UPLOADED_HOST } from '../shared/constants/constants';
import { OrderService } from '../shared/services/order.service';
import { NotyService } from '../noty/noty.service';
import { forkJoin, Observable, of } from 'rxjs';
import { ResponseDto } from '../shared/dtos/response.dto';

@Component({
  selector: 'order-items',
  templateUrl: './order-items.component.html',
  styleUrls: ['./order-items.component.scss']
})
export class OrderItemsComponent implements OnInit {

  lang = DEFAULT_LANG;
  uploadedHost = UPLOADED_HOST;
  isLoading: boolean = false;

  @Input() omitReservedOnCreate: boolean = false;
  @Input() items: OrderItemDto[] = [];
  @Output() itemsChanged: EventEmitter<OrderItemDto[]> = new EventEmitter();

  @ViewChild(ProductSelectorComponent) productSelectorCmp: ProductSelectorComponent;

  get itemsCost(): number {
    return this.items.reduce((acc, orderItem) => acc + orderItem.cost, 0);
  }

  constructor(
    private orderService: OrderService,
    private notyService: NotyService,
    ) { }

  ngOnInit(): void {
    if (this.items.length) {
      this.recreateOrderItems();
    }
  }

  showProductSelector() {
    this.productSelectorCmp.showSelector();
  }

  onProductSelect({ variant, qty }) {
    const found = this.items.find(item => item.sku === variant.sku);
    if (found) {
      qty += found.qty;
    }

    this.createOrderItem(variant.sku, qty);
  }

  onOrderItemQtyBlur(target: any, orderItem: OrderItemDto) {
    const newValue = parseInt(target.value);
    if (!newValue) {
      target.value = orderItem.qty.toString();
      return;
    }

    this.createOrderItem(orderItem.sku, newValue);
  }

  createOrderItem(sku: string, qty: number) {
    this.isLoading = true;
    this.orderService.createOrderItem(sku, qty, this.omitReservedOnCreate)
      .pipe(
        this.notyService.attachNoty(),
        tap(response => this.addOrderItem(sku, response.data)),
        finalize(() => this.isLoading = false)
      )
      .subscribe(_ => this.itemsChanged.next(this.items));
  }

  recreateOrderItems() {
    const items = this.items.splice(0);

    const getItemRequest = (item: OrderItemDto): Observable<ResponseDto<OrderItemDto> | null> => this.orderService
      .createOrderItem(item.sku, item.qty, this.omitReservedOnCreate)
      .pipe(
        this.notyService.attachNoty(),
        tap((response) => this.addOrderItem(response.data.sku, response.data)),
        catchError(_ => of(null))
      );

    forkJoin(
      ...items.map(getItemRequest)
    )
      .subscribe(_ => this.itemsChanged.next(this.items));
  }

  removeOrderItem(index: number) {
    this.items.splice(index, 1);
    this.itemsChanged.next(this.items);
  }

  private addOrderItem(sku: string, itemArg: OrderItemDto) {
    const foundIdx = this.items.findIndex(item => item.sku === sku);
    if (foundIdx === -1) {
      this.items.push(itemArg);
    } else {
      this.items[foundIdx] = itemArg;
    }
  }
}
