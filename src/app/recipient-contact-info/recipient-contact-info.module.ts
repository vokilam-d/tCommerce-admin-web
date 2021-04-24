import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipientContactInfoComponent } from './recipient-contact-info.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactInfoModule } from '../contact-info/contact-info.module';



@NgModule({
  declarations: [RecipientContactInfoComponent],
  exports: [
    RecipientContactInfoComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContactInfoModule
  ]
})
export class RecipientContactInfoModule { }
