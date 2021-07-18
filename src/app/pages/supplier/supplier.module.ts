import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupplierRoutingModule } from './supplier-routing.module';
import { SupplierComponent } from './supplier.component';
import { MediaAssetModule } from '../../media-asset/media-asset.module';
import { MediaUploaderModule } from '../../media-uploader/media-uploader.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RatingSelectorModule } from '../../rating-selector/rating-selector.module';
import { SharedModule } from '../../shared/shared.module';
import { PreloaderModule } from '../../preloader/preloader.module';


@NgModule({
  declarations: [SupplierComponent],
  imports: [
    CommonModule,
    SupplierRoutingModule,
    MediaAssetModule,
    MediaUploaderModule,
    ReactiveFormsModule,
    RatingSelectorModule,
    SharedModule,
    PreloaderModule
  ]
})
export class SupplierModule { }
