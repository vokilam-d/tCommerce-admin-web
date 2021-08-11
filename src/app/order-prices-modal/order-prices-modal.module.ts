import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderPricesModalComponent } from './order-prices-modal.component';
import { SharedModule } from '../shared/shared.module';
import { OrderPricesModule } from '../order-prices/order-prices.module';
import { PreloaderModule } from '../preloader/preloader.module';


@NgModule({
  declarations: [OrderPricesModalComponent],
  imports: [
    CommonModule,
    SharedModule,
    OrderPricesModule,
    PreloaderModule
  ],
  exports: [OrderPricesModalComponent]
})
export class OrderPricesModalModule { }
