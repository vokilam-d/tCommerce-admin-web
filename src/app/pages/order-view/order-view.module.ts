import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderViewRoutingModule } from './order-view-routing.module';
import { OrderViewComponent } from './order-view.component';
import { SharedModule } from '../../shared/shared.module';
import { AddressFormModule } from '../../address-form/address-form.module';
import { PreloaderModule } from '../../preloader/preloader.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ShipmentInfoModalComponent } from './shipment-info-modal/shipment-info-modal.component';
import { InvoiceModalComponent } from './invoice-modal/invoice-modal.component';
import { ConfirmPackItemModalComponent } from './confirm-pack-item-modal/confirm-pack-item-modal.component';
import { MediaAssetModule } from '../../media-asset/media-asset.module';
import { ContactInfoModalComponent } from './contact-info-modal/contact-info-modal.component';
import { ContactInfoModule } from '../../contact-info/contact-info.module';
import { MediaUploaderModule } from '../../media-uploader/media-uploader.module';
import { OrderItemsModule } from '../../order-items/order-items.module';
import { OrderPricesModule } from '../../order-prices/order-prices.module';
import { OrderPricesModalComponent } from './order-prices-modal/order-prices-modal.component';
import { OrderItemsModalComponent } from './order-items-modal/order-items-modal.component';


@NgModule({
  declarations: [OrderViewComponent, ShipmentInfoModalComponent, InvoiceModalComponent, ConfirmPackItemModalComponent, ContactInfoModalComponent, OrderPricesModalComponent, OrderItemsModalComponent],
  imports: [
    CommonModule,
    OrderViewRoutingModule,
    SharedModule,
    AddressFormModule,
    PreloaderModule,
    ReactiveFormsModule,
    MediaAssetModule,
    ContactInfoModule,
    MediaUploaderModule,
    OrderPricesModule,
    OrderItemsModule
  ]
})
export class OrderViewModule { }
