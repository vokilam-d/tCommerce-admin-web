import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrderPricesDto } from '../shared/dtos/order-prices.dto';

@Component({
  selector: 'order-prices',
  templateUrl: './order-prices.component.html',
  styleUrls: ['./order-prices.component.scss']
})
export class OrderPricesComponent implements OnInit {

  @Input() prices: OrderPricesDto;
  @Output() pricesChanged: EventEmitter<OrderPricesDto> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onDiscountValueChange(target: any) {
    const discountValue = parseInt(target.value);
    this.prices.totalCost = this.prices.itemsCost - discountValue;
    this.pricesChanged.next(this.prices);
  }
}
