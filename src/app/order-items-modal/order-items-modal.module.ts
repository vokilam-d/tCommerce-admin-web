import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderItemsModalComponent } from './order-items-modal.component';
import { OrderItemsModule } from '../order-items/order-items.module';
import { SharedModule } from '../shared/shared.module';
import { PreloaderModule } from '../preloader/preloader.module';


@NgModule({
  declarations: [OrderItemsModalComponent],
  imports: [
    CommonModule,
    OrderItemsModule,
    SharedModule,
    PreloaderModule
  ],
  exports: [OrderItemsModalComponent]
})
export class OrderItemsModalModule { }
