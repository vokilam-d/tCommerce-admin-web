import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HeadService } from '../../shared/services/head.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotyService } from '../../noty/noty.service';
import { EPageAction } from '../../shared/enums/category-page-action.enum';
import { finalize } from 'rxjs/operators';
import { NgUnsubscribe } from '../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { ProductService } from '../../shared/services/product.service';
import { DEFAULT_LANG, UPLOADED_HOST } from '../../shared/constants/constants';
import { AdditionalServiceDto } from '../../shared/dtos/additional-service.dto';
import { AdditionalServiceService } from '../../shared/services/additional-service.service';

@Component({
  selector: 'additional-service',
  templateUrl: './additional-service.component.html',
  styleUrls: ['./additional-service.component.scss']
})
export class AdditionalServiceComponent extends NgUnsubscribe implements OnInit {

  isNewAdditionalService: boolean;
  additionalService: AdditionalServiceDto;
  form: FormGroup;
  isLoading: boolean = false;
  lang = DEFAULT_LANG;

  constructor(private additionalServicesService: AdditionalServiceService,
              private formBuilder: FormBuilder,
              private productService: ProductService,
              private headService: HeadService,
              private router: Router,
              private notyService: NotyService,
              private route: ActivatedRoute) {
    super();
  }

  ngOnInit() {
    this.init();
  }

  private init() {
    this.isNewAdditionalService = this.route.snapshot.data.action === EPageAction.Add;
    if (this.isNewAdditionalService) {
      this.additionalService = new AdditionalServiceDto();
      this.buildForm();
      this.headService.setTitle(`Новая доп. услуга`);
    } else {
      this.fetchAdditionalServiceAndBuildForm();
    }
  }

  save() {
    if (this.form.invalid) {
      this.notyService.showErrorNoty(`Ошибка в форме`);
      this.validateControls(this.form);
      return;
    }

    if (this.isNewAdditionalService) {
      this.addNewAdditionalService();
    } else {
      this.updateAdditionalService();
    }
  }

  delete() {
    if (!confirm(`Вы действительно хотите удалить эту доп. услугу?`)) {
      return;
    }

    this.additionalServicesService.deleteAdditionalService(this.additionalService.id)
      .pipe(this.notyService.attachNoty({ successText: 'Доп. услуга успешно удалена' }))
      .subscribe(
        _ => {
          this.goBack();
        },
        error => console.warn(error)
      );
  }

  private buildForm() {
    const controls: Record<keyof Omit<AdditionalServiceDto, 'id'>, any> = {
      name: [this.additionalService.name, Validators.required],
      clientName: [this.additionalService.clientName],
      isEnabled: [this.additionalService.isEnabled],
      price: [this.additionalService.price]
    }

    this.form = this.formBuilder.group(controls);
  }

  private fetchAdditionalServiceAndBuildForm() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isLoading = true;
    this.additionalServicesService.fetchAdditionalService(parseInt(id))
      .pipe(this.notyService.attachNoty(), finalize(() => this.isLoading = false))
      .subscribe(
        response => {
          this.additionalService = response.data;
          this.buildForm();
          this.headService.setTitle(this.additionalService.name[DEFAULT_LANG]);
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

  private addNewAdditionalService() {
    const dto = { ...this.additionalService, ...this.form.value };

    this.additionalServicesService.addNewAdditionalService(dto)
      .pipe(this.notyService.attachNoty({ successText: 'Доп. услуга успешно добавлена' }))
      .subscribe(
        response => {
          this.router.navigate(['admin', 'additional-service', 'edit', response.data.id]);
        },
        error => console.warn(error)
      );
  }

  private updateAdditionalService() {
    const dto = { ...this.additionalService, ...this.form.value };

    this.additionalServicesService.updateAdditionalService(this.additionalService.id, dto)
      .pipe(this.notyService.attachNoty({ successText: 'Доп. услуга успешно обновлена' }))
      .subscribe(
        response => {
          this.additionalService = response.data;
          this.buildForm();
        },
        error => console.warn(error)
      );
  }

  goBack() {
    this.router.navigate(['admin', 'additional-service']);
  }
}

