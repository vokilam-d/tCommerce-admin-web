import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerContactInfoComponent } from './customer-contact-info.component';
import { ContactInfoModule } from '../contact-info/contact-info.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [CustomerContactInfoComponent],
  exports: [
    CustomerContactInfoComponent
  ],
  imports: [
    CommonModule,
    ContactInfoModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class CustomerContactInfoModule { }
