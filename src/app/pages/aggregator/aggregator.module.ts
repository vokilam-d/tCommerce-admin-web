import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AggregatorRoutingModule } from './aggregator-routing.module';
import { AggregatorComponent } from './aggregator.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { PreloaderModule } from '../../preloader/preloader.module';
import { ProductSelectorModule } from '../../product-selector/product-selector.module';
import { MultilingualControlModule } from '../../multilingual-control/multilingual-control.module';


@NgModule({
  declarations: [AggregatorComponent],
  imports: [
    CommonModule,
    AggregatorRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    PreloaderModule,
    ProductSelectorModule,
    MultilingualControlModule
  ]
})
export class AggregatorModule { }
