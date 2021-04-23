import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DEFAULT_PHONE_NUMBER_VALUE } from '../constants/constants';

export class CustomValidators {
  private static invalidSlugRegex = /[^a-z0-9\-.]/;
  private static validPasswordRegex = /^$|((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,}))/;

  static passwordConfirm(passwordControl: AbstractControl): ValidatorFn {
    return (passwordConfirmControl: AbstractControl): ValidationErrors | null => {
      if (passwordConfirmControl.value !== passwordControl.value) {
        return { mismatch: true };
      }

      return null;
    }
  }

  static slug(control: AbstractControl): ValidationErrors | null {
    control.markAsTouched();

    const value = control.value as string;
    if (value.match(CustomValidators.invalidSlugRegex)) {
      return { invalid: true };
    }

    return null;
  }

  static password(control: AbstractControl): ValidationErrors | null {
    control.markAsTouched();

    const value = control.value as string;
    if (value.match(CustomValidators.validPasswordRegex)) {
      return null;
    }

    return { invalid: true };
  }

  static phoneNumber(phoneControl: AbstractControl): ValidationErrors | null {
    const value: string = phoneControl.value;
    if (!value) {
      return { error: true };
    }

    const defaultValue = value.indexOf(DEFAULT_PHONE_NUMBER_VALUE) === 0
      || value.indexOf(DEFAULT_PHONE_NUMBER_VALUE.slice(1)) === 0;
    if (defaultValue && value.length !== 12) {
      return { error: true };
    }

    return null;
  }
}
