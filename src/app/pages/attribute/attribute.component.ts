import { Component, OnInit } from '@angular/core';
import { EPageAction } from '../../shared/enums/category-page-action.enum';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AttributeDto, AttributeValueDto, CreateAttributeDto } from '../../shared/dtos/attribute.dto';
import { AttributeService } from '../../shared/services/attribute.service';
import { NotyService } from 'src/app/noty/noty.service';
import { finalize } from 'rxjs/operators';
import { HeadService } from '../../shared/services/head.service';
import { EAttributeType } from '../../shared/enums/attribute-type.enum';
import { ISelectOption } from '../../shared/components/select/select-option.interface';

class TransformedAttributeValue extends AttributeValueDto {
  isNew: boolean = true;
}

@Component({
  selector: 'attribute',
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.scss']
})
export class AttributeComponent implements OnInit {

  isNewAttribute: boolean;
  attribute: AttributeDto;
  form: FormGroup;
  isLoading: boolean = false;
  typeOptions: ISelectOption[] = [{ data: EAttributeType.Select }, { data: EAttributeType.MultiSelect }];

  get hasColorControl() { return this.form.get('hasColor'); }
  get values(): TransformedAttributeValue[] { return this.form.get('values').value; }

  constructor(
    private formBuilder: FormBuilder,
    private attributeService: AttributeService,
    private headService: HeadService,
    private router: Router,
    private notyService: NotyService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.init();
  }

  private init() {
    this.isNewAttribute = this.route.snapshot.data.action === EPageAction.Add;

    if (this.isNewAttribute) {
      this.buildForm(new CreateAttributeDto());
      this.headService.setTitle(`Новый атрибут`);
    } else {
      this.fetchAttribute();
    }
  }

  goBack() {
    this.router.navigate(['admin', 'attribute']);
  }

  save() {
    if (this.form.invalid) {
      this.notyService.showErrorNoty(`Ошибка в форме`);
      this.validateAllControls();
      return;
    }

    if (this.isNewAttribute) {
      this.addNewAttribute();
    } else {
      this.updateAttribute();
    }
  }

  deleteAttribute() {
    if (!confirm(`Вы действительно хотите удалить атрибут ${this.attribute.id}?`)) {
      return;
    }

    this.isLoading = true;
    this.attributeService.deleteAttribute(this.attribute.id)
      .pipe(
        finalize(() => this.isLoading = false),
        this.notyService.attachNoty({ successText: `Атрибут успешно удалён` })
      )
      .subscribe(
        _ => {
          this.goBack();
        },
        error => console.warn(error)
      );
  }

  addOption() {
    const controlOptions = this.form.get('values').value as AttributeValueDto[];
    controlOptions.push(new TransformedAttributeValue());
  }

  onRadioChange(optionIndex: number) {
    const controlOptions = this.form.get('values').value as AttributeValueDto[];
    controlOptions.forEach((option, index) => {
      option.isDefault = optionIndex === index;
    });
  }

  deleteOption(index: number) {
    const controlOptions = this.form.get('values').value as AttributeValueDto[];
    controlOptions.splice(index, 1);
  }

  private buildForm(attribute: AttributeDto) {
    const controls: Record<keyof AttributeDto, any> = {
      id: [{ value: attribute.id, disabled: !this.isNewAttribute }],
      label: [attribute.label, Validators.required],
      values: [attribute.values],
      type: [attribute.type],
      isVisibleInFilters: attribute.isVisibleInFilters,
      isVisibleInProduct: attribute.isVisibleInProduct,
      hasColor: attribute.hasColor,
    }

    this.form = this.formBuilder.group(controls);
  }

  private fetchAttribute() {
    const id = this.route.snapshot.paramMap.get('id');

    this.isLoading = true;
    this.attributeService.fetchAttribute(id)
      .pipe( finalize(() => this.isLoading = false), this.notyService.attachNoty() )
      .subscribe(
        response => {
          this.attribute = response.data;
          this.buildForm(this.attribute);
          this.headService.setTitle(this.attribute.id);
        },
        error => console.warn(error)
      );
  }

  private validateAllControls() {
    Object.values(this.form.controls).forEach(control => {
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      }
    });
  }

  isControlInvalid(control: AbstractControl) {
    return !control.valid && control.touched;
  }

  private addNewAttribute() {
    const dto = this.form.value;

    this.isLoading = true;
    this.attributeService.addNewAttribute(dto)
      .pipe(
        finalize(() => this.isLoading = false),
        this.notyService.attachNoty({ successText: `Атрибут успешно сохранён` })
      )
      .subscribe(
        response => {
          const attribute = response.data;
          this.router.navigate(['admin', 'attribute', 'edit', attribute.id]);
        },
        error => console.warn(error)
      );
  }

  private updateAttribute() {
    const dto = {
      ...this.attribute,
      ...this.form.value
    };

    this.isLoading = true;
    this.attributeService.updateAttribute(this.attribute.id, dto)
      .pipe(
        finalize(() => this.isLoading = false),
        this.notyService.attachNoty({ successText: 'Атрибут успешно изменён' })
      )
      .subscribe(
        response => {
          this.attribute = response.data;
          this.buildForm(this.attribute);
        },
        error => console.warn(error)
      );
  }
}
