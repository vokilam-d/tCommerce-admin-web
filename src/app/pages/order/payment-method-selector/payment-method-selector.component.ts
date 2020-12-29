import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PaymentMethodDto } from '../../../shared/dtos/payment-method.dto';
import { PaymentMethodService } from '../../../shared/services/payment-method.service';
import { DEFAULT_LANG } from '../../../shared/constants/constants';

@Component({
  selector: 'payment-method-selector',
  templateUrl: './payment-method-selector.component.html',
  styleUrls: ['./payment-method-selector.component.scss']
})
export class PaymentMethodSelectorComponent implements OnInit {

  lang = DEFAULT_LANG;
  private methods: PaymentMethodDto[] = [];

  get enabledMethods(): PaymentMethodDto[] { return this.methods.filter(method => method.isEnabled); }

  @Input('activeId') activeMethodId: string;
  @Output() selected: EventEmitter<PaymentMethodDto> = new EventEmitter();

  constructor(private paymentMethodService: PaymentMethodService) { }

  ngOnInit() {
    this.init();
  }

  private init() {
    this.paymentMethodService.fetchAllMethods()
      .subscribe(
        response => {
          this.methods = response.data;
        }
      );
  }

  selectMethod(method: PaymentMethodDto) {
    this.activeMethodId = method.id;
    this.selected.emit(method);
  }

}
