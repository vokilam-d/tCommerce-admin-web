import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethodSelectorComponent } from './payment-method-selector.component';


@NgModule({
  declarations: [
    PaymentMethodSelectorComponent
  ],
  exports: [
    PaymentMethodSelectorComponent
  ],
  imports: [
    CommonModule
  ]
})
export class PaymentMethodSelectorModule { }
