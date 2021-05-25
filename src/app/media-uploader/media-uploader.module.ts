import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaUploaderComponent } from './media-uploader.component';
import { PreloaderModule } from '../preloader/preloader.module';


@NgModule({
  declarations: [MediaUploaderComponent],
  imports: [
    CommonModule,
    PreloaderModule
  ],
  exports: [MediaUploaderComponent]
})
export class MediaUploaderModule { }
