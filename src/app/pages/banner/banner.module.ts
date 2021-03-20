import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BannerRoutingModule } from './banner-routing.module';
import { BannerComponent } from './banner.component';
import { ProductSelectorModule } from '../../product-selector/product-selector.module';
import { BannerTypeModalComponent } from './banner-type-modal/banner-type-modal.component';
import { SharedModule } from '../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PostSelectorModule} from "../../post-selector/post-selector.module";
import {MediaAssetModule} from "../../media-asset/media-asset.module";
import {MediaUploaderModule} from "../../media-uploader/media-uploader.module";
import {ProductCategorySelectModule} from "../../product-category-select/product-category-select.module";


@NgModule({
  declarations: [BannerComponent, BannerTypeModalComponent],
  imports: [
    CommonModule,
    BannerRoutingModule,
    ProductSelectorModule,
    SharedModule,
    ReactiveFormsModule,
    PostSelectorModule,
    MediaAssetModule,
    MediaUploaderModule,
    FormsModule,
    ProductCategorySelectModule
  ]
})
export class BannerModule { }
