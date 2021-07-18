import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupplierListRoutingModule } from './supplier-list-routing.module';
import { SupplierListComponent } from './supplier-list.component';
import { GridModule } from '../../grid/grid.module';


@NgModule({
  declarations: [SupplierListComponent],
  imports: [
    CommonModule,
    SupplierListRoutingModule,
    GridModule
  ]
})
export class SupplierListModule { }
