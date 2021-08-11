import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrderPricesDto } from '../../../shared/dtos/order-prices.dto';
import { OrderService } from '../../../shared/services/order.service';
import { NotyService } from '../../../noty/noty.service';
import { finalize } from 'rxjs/operators';
import { OrderItemDto } from '../../../shared/dtos/order-item.dto';

@Component({
  selector: 'order-items-modal',
  templateUrl: './order-items-modal.component.html',
  styleUrls: ['./order-items-modal.component.scss']
})
export class OrderItemsModalComponent implements OnInit {

  isModalVisible: boolean = false;
  isLoading: boolean = false;
  cachedItems: OrderItemDto[];

  @Input() orderId: number;
  @Input() items: OrderItemDto[] = [];
  @Output() itemsChanged: EventEmitter<{ items: OrderItemDto[], prices: OrderPricesDto }> = new EventEmitter();

  constructor(
    private orderService: OrderService,
    private notyService: NotyService
  ) { }

  ngOnInit(): void {
  }

  openModal() {
    this.isModalVisible = true;
    this.cachedItems = JSON.parse(JSON.stringify(this.items));
  }

  closeModal() {
    this.isModalVisible = false;
  }

  onItemsChange(items: OrderItemDto[]) {
    this.cachedItems = items;
  }

  save() {
    this.isLoading = true;
    this.orderService.updateOrderItems(this.orderId, this.cachedItems)
      .pipe(
        this.notyService.attachNoty({ successText: `Товары и стоимость успешно обновлены` }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(response => {
        const { items, prices } = response.data;
        this.itemsChanged.next({ items, prices });
        this.closeModal();
      });
  }
}
