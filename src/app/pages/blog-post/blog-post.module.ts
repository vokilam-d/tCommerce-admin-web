import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlogPostRoutingModule } from './blog-post-routing.module';
import { BlogPostComponent } from './blog-post.component';
import { PreloaderModule } from '../../preloader/preloader.module';
import { ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { SharedModule } from '../../shared/shared.module';
import { MediaAssetModule } from '../../media-asset/media-asset.module';
import { MediaUploaderModule } from '../../media-uploader/media-uploader.module';
import { LinkedProductsModule } from '../../linked-products/linked-products.module';
import { LinkedPostsModule } from './linked-posts/linked-posts.module';
import { MultilingualControlModule } from '../../multilingual-control/multilingual-control.module';


@NgModule({
  declarations: [BlogPostComponent],
  imports: [
    CommonModule,
    BlogPostRoutingModule,
    PreloaderModule,
    ReactiveFormsModule,
    QuillModule,
    SharedModule,
    MediaAssetModule,
    MediaUploaderModule,
    LinkedProductsModule,
    LinkedPostsModule,
    MultilingualControlModule
  ]
})
export class BlogPostModule { }
