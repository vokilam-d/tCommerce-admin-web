import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultilingualControlComponent } from './multilingual-control.component';
import { ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';



@NgModule({
  declarations: [MultilingualControlComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    QuillModule
  ],
  exports: [MultilingualControlComponent]
})
export class MultilingualControlModule { }
