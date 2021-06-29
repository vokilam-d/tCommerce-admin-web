import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ContactInfoDto } from '../shared/dtos/contact-info.dto';
import { RecipientTypeEnum } from '../shared/enums/recipient-type.enum';
import { AbstractControl, FormControl } from '@angular/forms';
import { ContactInfoComponent } from '../contact-info/contact-info.component';
import { takeUntil } from 'rxjs/operators';
import { NgUnsubscribe } from '../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';

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
  @Input('contactInfo') contactInfoInput: ContactInfoDto;

  @ViewChild(ContactInfoComponent) contactInfoCmp: ContactInfoComponent;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.setDefaultRecipientOption();
  }

  private setDefaultRecipientOption() {
    this.contactInfoForCmp = this.contactInfoInput;

    const controlValue = this.contactInfoInput.lastName ? RecipientTypeEnum.ANOTHER_PERSON : RecipientTypeEnum.CUSTOMER;
    this.recipientControl.setValue(controlValue);

    this.handleRecipientControl();
  }

  private handleRecipientControl() {
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
