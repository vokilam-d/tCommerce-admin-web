import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderItemsComponent } from './order-items.component';
import { ProductSelectorModule } from '../product-selector/product-selector.module';
import { SharedModule } from '../shared/shared.module';
import { PreloaderModule } from '../preloader/preloader.module';


@NgModule({
  declarations: [OrderItemsComponent],
  imports: [
    CommonModule,
    ProductSelectorModule,
    SharedModule,
    PreloaderModule
  ],
  exports: [OrderItemsComponent]
})
export class OrderItemsModule { }
