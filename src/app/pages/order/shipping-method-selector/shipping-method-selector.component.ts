import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ShippingMethodService } from '../../../shared/services/shipping-method.service';
import { ShippingMethodDto } from '../../../shared/dtos/shipping-method.dto';
import { DEFAULT_LANG } from '../../../shared/constants/constants';

@Component({
  selector: 'shipping-method-selector',
  templateUrl: './shipping-method-selector.component.html',
  styleUrls: ['./shipping-method-selector.component.scss']
})
export class ShippingMethodSelectorComponent implements OnInit {

  lang = DEFAULT_LANG;
  private methods: ShippingMethodDto[] = [];

  get enabledMethods(): ShippingMethodDto[] { return this.methods.filter(method => method.isEnabled); }

  @Input('activeId') activeMethodId: string;
  @Output() selected: EventEmitter<ShippingMethodDto> = new EventEmitter();

  constructor(private shippingMethodService: ShippingMethodService) { }

  ngOnInit() {
    this.init();
  }

  private init() {
    this.shippingMethodService.fetchAllMethods()
      .subscribe(
        response => {
          this.methods = response.data;
        }
      );
  }

  selectMethod(method: ShippingMethodDto) {
    this.activeMethodId = method.id;
    this.selected.emit(method);
  }
}
