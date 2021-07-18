import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotyService } from '../../noty/noty.service';
import { EPageAction } from '../../shared/enums/category-page-action.enum';
import { SupplierDto } from '../../shared/dtos/supplier.dto';
import { SupplierService } from '../../shared/services/supplier.service';
import { finalize } from 'rxjs/operators';
import { HeadService } from '../../shared/services/head.service';

@Component({
  selector: 'supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss']
})
export class SupplierComponent implements OnInit {

  isNewSupplier: boolean;
  supplier: SupplierDto;
  supplierForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private supplierService: SupplierService,
    private formBuilder: FormBuilder,
    private router: Router,
    private headService: HeadService,
    private notyService: NotyService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.init();
  }

  private init() {
    this.isNewSupplier = this.route.snapshot.data.action === EPageAction.Add;
    if (this.isNewSupplier) {
      this.supplier = new SupplierDto();
      this.buildForm();
      this.headService.setTitle(`Новый поставщик`);
    } else {
      this.fetchSupplier();
    }
  }

  save() {
    if (this.supplierForm.invalid) {
      this.notyService.showErrorNoty(`Ошибка в форме`);
      this.validateControls(this.supplierForm);
      return;
    }

    if (this.isNewSupplier) {
      this.addNewSupplier();
    } else {
      this.updateSupplier();
    }
  }

  delete() {
    if (!confirm(`Вы действительно хотите удалить этого поставщика?`)) {
      return;
    }

    this.supplierService.deleteSupplier(this.supplier.id)
      .pipe(this.notyService.attachNoty({ successText: 'Поставщик успешно удалён' }))
      .subscribe(
        _ => {
          this.goBack();
        },
        error => console.warn(error)
      );
  }

  private buildForm() {
    this.supplierForm = this.formBuilder.group({
      name: [this.supplier.name, Validators.required],
    });
  }

  private fetchSupplier() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isLoading = true;
    this.supplierService.fetchSupplier(id)
      .pipe(this.notyService.attachNoty(), finalize(() => this.isLoading = false))
      .subscribe(
        response => {
          this.supplier = response.data;
          this.buildForm();
          this.headService.setTitle(`Поставщик ${this.supplier.name}`);
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

  isControlInvalid(control: AbstractControl) {
    return !control.valid && control.touched;
  }

  private addNewSupplier() {
    const dto = { ...this.supplier, ...this.supplierForm.value };

    this.supplierService.addNewSupplier(dto)
      .pipe(this.notyService.attachNoty({ successText: 'Поставщик успешно добавлен' }))
      .subscribe(
        response => {
          this.router.navigate(['admin', 'supplier', 'edit', response.data.id]);
        },
        error => console.warn(error)
      );
  }

  private updateSupplier() {
    const dto = { ...this.supplier, ...this.supplierForm.value };

    this.supplierService.updateSupplier(this.supplier.id, dto)
      .pipe(this.notyService.attachNoty({ successText: 'Поставщик успешно обновлён' }))
      .subscribe(
        response => {
          this.supplier = response.data;
          this.buildForm();
        },
        error => console.warn(error)
      );
  }

  goBack() {
    this.router.navigate(['admin', 'supplier']);
  }
}
