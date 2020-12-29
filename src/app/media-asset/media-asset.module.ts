import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaAssetComponent } from './media-asset.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { MultilingualControlModule } from '../multilingual-control/multilingual-control.module';


@NgModule({
  declarations: [MediaAssetComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    MultilingualControlModule
  ],
  exports: [MediaAssetComponent]
})
export class MediaAssetModule { }
