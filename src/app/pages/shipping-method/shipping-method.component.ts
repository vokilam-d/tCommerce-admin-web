import { Component, OnInit } from '@angular/core';
import { ShippingMethodService } from '../../shared/services/shipping-method.service';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ShippingMethodDto } from '../../shared/dtos/shipping-method.dto';
import { NotyService } from '../../noty/noty.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { HeadService } from '../../shared/services/head.service';
import { DEFAULT_LANG } from '../../shared/constants/constants';

@Component({
  selector: 'shipping-method',
  templateUrl: './shipping-method.component.html',
  styleUrls: ['./shipping-method.component.scss']
})
export class ShippingMethodComponent implements OnInit {

  shippingMethods: ShippingMethodDto[] = [];
  activeMethod: ShippingMethodDto;
  form: FormGroup;
  isLoading: boolean = false;
  lang = DEFAULT_LANG;

  constructor(
    private shippingMethodService: ShippingMethodService,
    private notyService: NotyService,
    private router: Router,
    private headService: HeadService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.init();
  }

  private init() {
    this.activeMethod = null;
    this.isLoading = true;
    this.shippingMethodService.fetchAllMethods()
      .pipe( finalize(() => this.isLoading = false) )
      .subscribe(
        response => {
          this.shippingMethods = response.data;

          if (this.shippingMethods[0]) {
            this.selectMethod(this.shippingMethods[0]);
          }
        }
      );
  }

  selectMethod(shippingMethod: ShippingMethodDto) {
    this.activeMethod = shippingMethod;

    this.form = this.formBuilder.group({
      isEnabled: shippingMethod.isEnabled,
      adminName: [shippingMethod.adminName, Validators.required],
      clientName: [shippingMethod.clientName, Validators.required],
      price: shippingMethod.price,
      sortOrder: shippingMethod.sortOrder
    });

    this.headService.setTitle(this.activeMethod.adminName[DEFAULT_LANG] || `Новый способ доставки`);
  }

  addNewMethod() {
    const newMethod = new ShippingMethodDto();
    this.shippingMethods.push(newMethod);
    this.selectMethod(newMethod);
  }

  saveMethod() {
    if (this.form.invalid) {
      this.notyService.showErrorNoty(`Ошибка в форме`);
      this.validateControls();
      return;
    }

    const dto: ShippingMethodDto = {
      ...this.activeMethod,
      ...this.form.value
    };

    if (dto.id) {
      this.shippingMethodService.updateShippingMethod(dto.id, dto)
        .pipe(this.notyService.attachNoty({ successText: `Способ доставки успешно обновлён` }))
        .subscribe(_ => this.init());
    } else {

      this.shippingMethodService.createShippingMethod(dto)
        .pipe(this.notyService.attachNoty({ successText: `Способ доставки успешно создан` }))
        .subscribe(_ => this.init());
    }
  }

  deleteMethod() {
    if (!this.activeMethod.id || !confirm(`Вы уверены, что хотите удалить '${this.activeMethod.adminName}'?`)) {
      return;
    }

    this.shippingMethodService.deleteShippingMethod(this.activeMethod.id)
      .pipe(this.notyService.attachNoty({ successText: `Способ доставки успешно удалён` }))
      .subscribe(_ => this.init());
  }

  private validateControls(form: FormGroup | FormArray = this.form) {
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
}
