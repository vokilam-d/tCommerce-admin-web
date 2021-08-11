import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderPricesComponent } from './order-prices.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [OrderPricesComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule
  ],
  exports: [OrderPricesComponent]
})
export class OrderPricesModule { }
