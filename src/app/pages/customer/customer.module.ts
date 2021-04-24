import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerComponent } from './customer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { GridModule } from '../../grid/grid.module';
import { AddressFormModule } from '../../address-form/address-form.module';
import { OrderListViewerModule } from '../../order-list-viewer/order-list-viewer.module';
import { StoreReviewListViewerModule } from '../../store-review-list-viewer/store-review-list-viewer.module';
import { ProductReviewListViewerModule } from '../../product-review-list-viewer/product-review-list-viewer.module';
import { CustomerContactInfoModule } from '../../customer-contact-info/customer-contact-info.module';


@NgModule({
  declarations: [CustomerComponent],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    ReactiveFormsModule,
    GridModule,
    SharedModule,
    OrderListViewerModule,
    AddressFormModule,
    StoreReviewListViewerModule,
    ProductReviewListViewerModule,
    CustomerContactInfoModule
  ]
})
export class CustomerModule { }
