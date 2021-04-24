import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { IS_EMAIL_REGEX } from '../shared/constants/constants';
import { ContactInfoComponent } from '../contact-info/contact-info.component';
import { CustomerDto } from '../shared/dtos/customer.dto';
import { ContactInfoDto } from '../shared/dtos/contact-info.dto';
import { NgUnsubscribe } from '../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { CustomerContactInfoDto } from '../shared/dtos/customer-contact-info.dto';

@Component({
  selector: 'customer-contact-info',
  templateUrl: './customer-contact-info.component.html',
  styleUrls: ['./customer-contact-info.component.scss']
})
export class CustomerContactInfoComponent extends NgUnsubscribe implements OnInit {

  emailControl: FormControl = new FormControl('', [Validators.pattern(IS_EMAIL_REGEX), Validators.required]);

  contactInfo: ContactInfoDto;

  @Input() customer: CustomerDto;

  @ViewChild(ContactInfoComponent) contactInfoCmp: ContactInfoComponent;

  constructor(
  ) {
    super();
  }

  ngOnInit(): void {
    this.contactInfo = this.customer.contactInfo;

    this.setCustomerEmail();
  }

  private setCustomerEmail() {
    this.emailControl.setValue(this.customer.contactInfo.email);
  }

  public checkValidity(): boolean {
    let isValid: boolean = true;

    if (this.emailControl.invalid) {
      this.emailControl.markAsTouched({ onlySelf: true });
      isValid = false;
    }

    if (!this.contactInfoCmp.checkValidity()) {
      isValid = false;
    }

    return isValid;
  }

  public isEmailInvalid() {
    return this.emailControl.invalid && this.emailControl.touched;
  }

  public getValue(): CustomerContactInfoDto {
    return {
      email: this.emailControl.value,
      ...this.contactInfoCmp.getValue()
    };
  }
}
