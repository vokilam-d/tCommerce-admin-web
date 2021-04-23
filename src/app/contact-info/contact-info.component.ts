import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { markControlsAsTouched } from '../shared/helpers/mark-controls-as-touched.function';
import { CustomValidators } from '../shared/classes/validators';
import { DEFAULT_PHONE_NUMBER_VALUE } from '../shared/constants/constants';
import { ContactInfoDto } from '../shared/dtos/contact-info.dto';

@Component({
  selector: 'contact-info',
  templateUrl: './contact-info.component.html',
  styleUrls: ['./contact-info.component.scss']
})
export class ContactInfoComponent implements OnInit {

  contactForm: FormGroup;

  @Input() contactInfo: ContactInfoDto;

  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.buildContactInfoForm(this.contactInfo);
  }

  private buildContactInfoForm(contactInfo: ContactInfoDto) {
    const controls: Partial<Record<keyof ContactInfoDto, any>> = {
      firstName: [contactInfo.firstName, Validators.required],
      lastName: [contactInfo.lastName, Validators.required],
      middleName: [contactInfo.middleName],
      phoneNumber: [contactInfo.phoneNumber || DEFAULT_PHONE_NUMBER_VALUE, CustomValidators.phoneNumber]
    };

    this.contactForm = this.formBuilder.group(controls);
  }

  public isControlInvalid(control: AbstractControl): boolean {
    return !control.valid && control.touched;
  }

  public checkValidity(): boolean {
    if (this.contactForm.invalid) {
      markControlsAsTouched(this.contactForm);
      return false;
    }

    return true;
  }

  public getValue(): ContactInfoDto {
    return this.contactForm.value;
  }
}
