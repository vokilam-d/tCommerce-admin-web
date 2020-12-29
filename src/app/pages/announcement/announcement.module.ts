import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnnouncementRoutingModule } from './announcement-routing.module';
import { AnnouncementComponent } from './announcement.component';
import { PreloaderModule } from '../../preloader/preloader.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [AnnouncementComponent],
  imports: [
    CommonModule,
    AnnouncementRoutingModule,
    PreloaderModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class AnnouncementModule { }
