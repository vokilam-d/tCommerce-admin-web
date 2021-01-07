import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductRoutingModule } from './product-routing.module';
import { ProductComponent } from './product.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { MediaAssetModule } from '../../media-asset/media-asset.module';
import { MediaUploaderModule } from '../../media-uploader/media-uploader.module';
import { ProductCategorySelectModule } from '../../product-category-select/product-category-select.module';
import { AttributesEditorComponent } from './attribute-editor/attributes-editor.component';
import { ReviewsViewerComponent } from './reviews-viewer/reviews-viewer.component';
import { RatingSelectorModule } from '../../rating-selector/rating-selector.module';
import { QuillModule } from 'ngx-quill';
import { PreloaderModule } from '../../preloader/preloader.module';
import { OrderListViewerModalComponent } from './order-list-viewer-modal/order-list-viewer-modal.component';
import { OrderListViewerModule } from '../../order-list-viewer/order-list-viewer.module';
import { GridModule } from '../../grid/grid.module';
import { RedirectControlModule } from '../../redirect-control/redirect-control.module';
import { LinkedProductsModule } from '../../linked-products/linked-products.module';
import { SetBreadcrumpsComponent } from './set-breadcrumps/set-breadcrumps.component';
import { MultilingualControlModule } from '../../multilingual-control/multilingual-control.module';



@NgModule({
  declarations: [ProductComponent, AttributesEditorComponent, ReviewsViewerComponent, OrderListViewerModalComponent, SetBreadcrumpsComponent],
  imports: [
    CommonModule,
    ProductRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    MediaAssetModule,
    MediaUploaderModule,
    ProductCategorySelectModule,
    RatingSelectorModule,
    QuillModule,
    PreloaderModule,
    OrderListViewerModule,
    GridModule,
    RedirectControlModule,
    LinkedProductsModule,
    MultilingualControlModule
  ],
  exports: [],
  providers: [ SetBreadcrumpsComponent ]
})
export class ProductModule {
}
