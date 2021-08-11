import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrderPricesDto } from '../shared/dtos/order-prices.dto';
import { OrderService } from '../shared/services/order.service';
import { NotyService } from '../noty/noty.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'order-prices-modal',
  templateUrl: './order-prices-modal.component.html',
  styleUrls: ['./order-prices-modal.component.scss']
})
export class OrderPricesModalComponent implements OnInit {

  isModalVisible: boolean = false;
  isLoading: boolean = false;
  cachedPrices: OrderPricesDto;

  @Input() orderId: number;
  @Input() prices: OrderPricesDto;
  @Output() pricesChanged: EventEmitter<OrderPricesDto> = new EventEmitter();

  constructor(
    private orderService: OrderService,
    private notyService: NotyService
  ) { }

  ngOnInit(): void {
  }

  openModal() {
    this.isModalVisible = true;
    this.cachedPrices = { ...this.prices };
  }

  closeModal() {
    this.isModalVisible = false;
  }

  onPricesChange(orderPrices: OrderPricesDto) {
    this.cachedPrices = orderPrices;
  }

  save() {
    this.isLoading = true;
    this.orderService.updateOrderPrices(this.orderId, this.cachedPrices)
      .pipe(
        this.notyService.attachNoty({ successText: `Стоимость успешно обновлена` }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(response => {
        this.pricesChanged.next(response.data.prices);
        this.closeModal();
      });
  }
}
