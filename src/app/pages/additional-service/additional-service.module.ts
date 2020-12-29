import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdditionalServiceRoutingModule } from './additional-service-routing.module';
import { AdditionalServiceComponent } from './additional-service.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { PreloaderModule } from '../../preloader/preloader.module';
import { MultilingualControlModule } from '../../multilingual-control/multilingual-control.module';


@NgModule({
  declarations: [AdditionalServiceComponent],
  imports: [
    CommonModule,
    AdditionalServiceRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    PreloaderModule,
    MultilingualControlModule
  ]
})
export class AdditionalServiceModule { }
