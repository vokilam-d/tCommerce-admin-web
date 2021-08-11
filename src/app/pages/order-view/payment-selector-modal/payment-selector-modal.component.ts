import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrderService } from '../../../shared/services/order.service';
import { NotyService } from '../../../noty/noty.service';
import { finalize } from 'rxjs/operators';
import { OrderPaymentInfoDto } from '../../../shared/dtos/order-payment-info.dto';
import { PaymentMethodDto } from '../../../shared/dtos/payment-method.dto';

@Component({
  selector: 'payment-selector-modal',
  templateUrl: './payment-selector-modal.component.html',
  styleUrls: ['./payment-selector-modal.component.scss']
})
export class PaymentSelectorModalComponent implements OnInit {

  isModalVisible: boolean = false;
  isLoading: boolean = false;
  cachedPaymentMethodId: string;

  @Input() orderId: number;
  @Input() paymentMethodId: string;
  @Output() paymentInfoChanged: EventEmitter<OrderPaymentInfoDto> = new EventEmitter();

  constructor(
    private orderService: OrderService,
    private notyService: NotyService
  ) { }

  ngOnInit(): void {
  }

  openModal() {
    this.isModalVisible = true;
    this.cachedPaymentMethodId = this.paymentMethodId;
  }

  closeModal() {
    this.isModalVisible = false;
  }

  onPaymentMethodSelect(paymentMethod: PaymentMethodDto) {
    this.cachedPaymentMethodId = paymentMethod.id;
  }

  save() {
    this.isLoading = true;
    this.orderService.updatePaymentMethod(this.orderId, this.cachedPaymentMethodId)
      .pipe(
        this.notyService.attachNoty({ successText: `Способ оплаты успешно обновлён` }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(response => {
        this.paymentInfoChanged.next(response.data.paymentInfo);
        this.closeModal();
      });
  }

}
