import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ContactInfoDto } from '../shared/dtos/contact-info.dto';
import { RecipientTypeEnum } from '../shared/enums/recipient-type.enum';
import { AbstractControl, FormControl } from '@angular/forms';
import { ContactInfoComponent } from '../contact-info/contact-info.component';
import { takeUntil } from 'rxjs/operators';
import { NgUnsubscribe } from '../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { CustomerContactInfoDto } from '../shared/dtos/customer-contact-info.dto';

@Component({
  selector: 'recipient-contact-info',
  templateUrl: './recipient-contact-info.component.html',
  styleUrls: ['./recipient-contact-info.component.scss']
})
export class RecipientContactInfoComponent extends NgUnsubscribe implements OnInit {

  recipientTypes: RecipientTypeEnum[] = [RecipientTypeEnum.CUSTOMER, RecipientTypeEnum.ANOTHER_PERSON];
  recipientTypeEnum = RecipientTypeEnum;
  recipientControl: FormControl = new FormControl();

  contactInfoForCmp: ContactInfoDto;
  @Input('customerContactInfo') customerContactInfoInput: CustomerContactInfoDto;
  @Input('contactInfo') contactInfoInput: ContactInfoDto;

  @ViewChild(ContactInfoComponent) contactInfoCmp: ContactInfoComponent;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.contactInfoForCmp = this.contactInfoInput;
    this.setDefaultRecipientOption();

    this.handleRecipientControlValueChange();
  }

  private setDefaultRecipientOption() {
    const isSameFirstName = this.customerContactInfoInput.firstName === this.contactInfoInput.firstName;
    const isSameLastName = this.customerContactInfoInput.lastName === this.contactInfoInput.lastName;
    const isSameMiddleName = this.customerContactInfoInput.middleName === this.contactInfoInput.middleName;
    const isSamePhone = this.customerContactInfoInput.phoneNumber === this.contactInfoInput.phoneNumber;
    const isSameContactInfo = isSameFirstName && isSameLastName && isSameMiddleName && isSamePhone;

    const controlValue = isSameContactInfo ? RecipientTypeEnum.CUSTOMER : RecipientTypeEnum.ANOTHER_PERSON;
    this.recipientControl.setValue(controlValue);
  }

  private handleRecipientControlValueChange() {
    this.recipientControl.valueChanges
      .pipe( takeUntil(this.ngUnsubscribe) )
      .subscribe(value => {
        this.contactInfoForCmp = value === RecipientTypeEnum.CUSTOMER ? null : this.contactInfoInput;
      });
  }

  public checkValidity(): boolean {
    if (this.recipientControl.value === RecipientTypeEnum.CUSTOMER) {
      return true;
    } else {
      return this.contactInfoCmp.checkValidity();
    }
  }

  public getValue(): ContactInfoDto {
    if (this.recipientControl.value === RecipientTypeEnum.CUSTOMER) {
      return null;
    } else {
      return this.contactInfoCmp.getValue();
    }
  }

  public isControlInvalid(control: AbstractControl) {
    return !control.valid && control.touched;
  }
}
