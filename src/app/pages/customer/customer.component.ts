import { Component, OnInit, ViewChild } from '@angular/core';
import { CustomerService } from '../../shared/services/customer.service';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotyService } from '../../noty/noty.service';
import { EPageAction } from '../../shared/enums/category-page-action.enum';
import { CustomerDto } from '../../shared/dtos/customer.dto';
import { ShipmentAddressDto } from '../../shared/dtos/shipment-address.dto';
import { finalize } from 'rxjs/operators';
import { HeadService } from '../../shared/services/head.service';
import { AddressFormComponent } from '../../address-form/address-form.component';
import { AddressTypeEnum } from '../../shared/enums/address-type.enum';

@Component({
  selector: 'customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {

  isNewCustomer: boolean;
  customer: CustomerDto;
  infoForm: FormGroup;
  isLoading: boolean = false;
  addressTypes = AddressTypeEnum;

  activeAddress: ShipmentAddressDto = null;

  tabsLabels: string[] = ['Информация о клиенте', 'Адреса', 'Заказы', 'Корзина', 'Отзывы о товарах', 'Список желаний'];

  @ViewChild(AddressFormComponent) addressFormCmp: AddressFormComponent;

  constructor(
    private customersService: CustomerService,
    private formBuilder: FormBuilder,
    private headService: HeadService,
    private router: Router,
    private notyService: NotyService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.init();
  }

  private init() {
    this.isNewCustomer = this.route.snapshot.data.action === EPageAction.Add;
    if (this.isNewCustomer) {
      this.customer = new CustomerDto();
      this.buildInfoForm();
      this.headService.setTitle(`Новый клиент`);
    } else {
      this.fetchCustomer();
    }
  }

  save() {
    if (this.infoForm.invalid) {
      this.notyService.showErrorNoty(`Ошибка в форме`);
      this.validateControls(this.infoForm);
      return;
    }

    if (this.isNewCustomer) {
      this.addNewCustomer();
    } else {
      this.updateCustomer();
    }
  }

  delete() {
    if (!confirm(`Вы действительно хотите удалить этого клиента?`)) {
      return;
    }

    this.customersService.deleteCustomer(this.customer.id)
      .pipe(this.notyService.attachNoty({ successText: 'Клиент успешно удалён' }))
      .subscribe(
        _ => {
          this.goBack();
        },
        error => console.warn(error)
      );
  }

  private buildInfoForm() {
    this.infoForm = this.formBuilder.group({
      firstName: [this.customer.firstName, Validators.required],
      lastName: [this.customer.lastName, Validators.required],
      email: this.customer.email,
      phoneNumber: this.customer.phoneNumber,
      note: this.customer.note,
      discountPercent: this.customer.discountPercent
    });
  }

  private fetchCustomer() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isLoading = true;
    this.customersService.fetchCustomer(id)
      .pipe(this.notyService.attachNoty(), finalize(() => this.isLoading = false))
      .subscribe(
        response => {
          this.customer = response.data;
          this.buildInfoForm();
          this.headService.setTitle(this.customer.firstName + ' ' + this.customer.lastName);
        },
        error => console.warn(error)
      );
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

  private addNewCustomer() {
    const dto = { ...this.customer, ...this.infoForm.value };

    this.customersService.addNewCustomer(dto)
      .pipe(this.notyService.attachNoty({ successText: 'Клиент успешно добавлен' }))
      .subscribe(
        response => {
          this.router.navigate(['admin', 'customer', 'edit', response.data.id]);
        },
        error => console.warn(error)
      );
  }

  private updateCustomer() {
    const dto = { ...this.customer, ...this.infoForm.value };

    this.customersService.updateCustomer(this.customer.id, dto)
      .pipe(this.notyService.attachNoty({ successText: 'Клиент успешно обновлён' }))
      .subscribe(
        response => {
          this.customer = response.data;
          this.buildInfoForm();
        },
        error => console.warn(error)
      );
  }

  goBack() {
    this.router.navigate(['admin', 'customer']);
  }

  setAsDefaultAddress(addressArg: ShipmentAddressDto) {
    this.customer.addresses.forEach(addr => addr.isDefault = false);
    addressArg.isDefault = true;
  }

  addAddress() {
    this.activeAddress = new ShipmentAddressDto();
  }

  editAddress(address: ShipmentAddressDto) {
    this.activeAddress = address;
  }

  onAddressFormSubmit() {
    if (!this.addressFormCmp.checkValidity()) { return; }
    const addressFormValue = this.addressFormCmp.getValue();

    if (addressFormValue.isDefault) {
      this.customer.addresses.forEach(addr => addr.isDefault = false);
    }

    const idx = this.customer.addresses.indexOf(this.activeAddress);
    if (idx === -1) {
      this.customer.addresses.push(addressFormValue);
    } else {
      this.customer.addresses[idx] = addressFormValue;
    }

    this.closeAndResetAddressForm();
  }

  removeAddress(addressIdx: number) {
    this.customer.addresses.splice(addressIdx, 1);
  }

  closeAndResetAddressForm() {
    this.activeAddress = null;
  }
}
