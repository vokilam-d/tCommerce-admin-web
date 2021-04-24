import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ShipmentAddressDto } from '../shared/dtos/shipment-address.dto';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AddressTypeEnum } from '../shared/enums/address-type.enum';
import { SettlementDto } from '../shared/dtos/settlement.dto';
import { WarehouseDto } from '../shared/dtos/warehouse.dto';
import { StreetDto } from '../shared/dtos/street.dto';
import { getPropertyOf } from '../shared/helpers/get-property-of.function';
import { takeUntil } from 'rxjs/operators';
import { NgUnsubscribe } from '../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';

@Component({
  selector: 'address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss']
})
export class AddressFormComponent extends NgUnsubscribe implements OnChanges {

  addressForm: FormGroup;
  addressTypes = [{ data: AddressTypeEnum.WAREHOUSE, view: 'В отделение' }, { data: AddressTypeEnum.DOORS, view: 'Адресная доставка' }];
  addressTypeEnum = AddressTypeEnum;
  get settlementIdControl() { return this.addressForm.get(getPropertyOf<ShipmentAddressDto>('settlementId')); }

  @Input() address: ShipmentAddressDto = new ShipmentAddressDto();
  @Input() showIsDefault: boolean = true;

  constructor(private formBuilder: FormBuilder) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.address && changes.address.currentValue) {
      this.buildAddressForm(changes.address.currentValue);
    }
  }

  private buildAddressForm(address: ShipmentAddressDto) {
    const controls: Partial<Record<keyof ShipmentAddressDto, any>> = {
      isDefault: [address.isDefault],
      type: [address.type, Validators.required],
      settlementName: [address.settlementName, Validators.required],
      settlementNameFull: [address.settlementNameFull],
      settlementId: [address.settlementId, Validators.required],
      addressName: [address.addressName, Validators.required],
      addressNameFull: [address.addressNameFull],
      addressId: [address.addressId, Validators.required],
      buildingNumber: address.buildingNumber,
      flat: address.flat
    };

    this.addressForm = this.formBuilder.group(controls);
    this.addressForm.get(addressTypeProp).valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((addressType: AddressTypeEnum) => {
        this.addressForm.get(addressIdProp).reset('');
        this.addressForm.get(addressProp).reset('');

        if (addressType === AddressTypeEnum.WAREHOUSE) {
          this.addressForm.get(buildingProp).reset('');
          this.addressForm.get(flatProp).reset('');
        }
      });
  }

  private validateControls(form: FormGroup | FormArray) {
    Object.values(form.controls).forEach(control => {
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        this.validateControls(control);
      }
    });
  }

  isControlInvalid(control: AbstractControl): boolean {
    return !control.valid && control.touched;
  }

  checkValidity(): boolean {
    if (this.addressForm.valid) {
      if (this.addressForm.get(addressTypeProp).value === AddressTypeEnum.DOORS) {
        return !!this.addressForm.get(buildingProp).value;
      } else {
        return true;
      }

    } else {
      this.validateControls(this.addressForm);
      return false;
    }
  }

  getValue(): ShipmentAddressDto {
    return this.addressForm.value;
  }

  onSettlementSelect(settlement: SettlementDto) {
    this.addressForm.get(settlementIdProp).setValue(settlement.id);
    this.addressForm.get(settlementProp).setValue(settlement.nameWithType);
    this.addressForm.get(settlementFullProp).setValue(settlement.fullName);
  }

  onWarehouseSelect(warehouse: WarehouseDto) {
    this.addressForm.get(addressIdProp).setValue(warehouse.id);
    this.addressForm.get(addressProp).setValue(warehouse.name);
    this.addressForm.get(addressFullProp).setValue(warehouse.description);
  }

  onStreetSelect(street: StreetDto) {
    this.addressForm.get(addressIdProp).setValue(street.id);
    this.addressForm.get(addressProp).setValue(street.name);
    this.addressForm.get(addressFullProp).setValue(street.name);
  }

  isOptionalControlInvalid(prop: keyof ShipmentAddressDto) {
    const addressType: AddressTypeEnum = this.addressForm.get(addressTypeProp).value;
    const control = this.addressForm.get(prop);

    switch (prop) {
      case 'buildingNumber':
        return addressType === AddressTypeEnum.DOORS && !control.value && control.touched;
    }
  }

  setAddressType(type: { view: string; data: AddressTypeEnum }) {
    this.addressForm.get(addressTypeProp).setValue(type.data);
  }
}

const settlementIdProp: keyof ShipmentAddressDto = 'settlementId';
const settlementProp: keyof ShipmentAddressDto = 'settlementName';
const settlementFullProp: keyof ShipmentAddressDto = 'settlementNameFull';
const addressIdProp: keyof ShipmentAddressDto = 'addressId';
const addressProp: keyof ShipmentAddressDto = 'addressName';
const addressFullProp: keyof ShipmentAddressDto = 'addressNameFull';
const addressTypeProp: keyof ShipmentAddressDto = 'type';
const buildingProp: keyof ShipmentAddressDto = 'buildingNumber';
const flatProp: keyof ShipmentAddressDto = 'flat';
