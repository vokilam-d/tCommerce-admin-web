import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectComponent } from '../select/select.component';
import { AttributeService } from '../../services/attribute.service';
import { ProductSelectedAttributeDto } from '../../dtos/selected-attribute.dto';
import { AttributeDto, AttributeValueDto } from '../../dtos/attribute.dto';
import { finalize, takeUntil } from 'rxjs/operators';
import { EAttributeType } from '../../enums/attribute-type.enum';
import { DEFAULT_LANG } from '../../constants/constants';
import { NotyService } from '../../../noty/noty.service';
import { ISelectOption } from '../select/select-option.interface';
import { MultilingualTextDto } from '../../dtos/multilingual-text.dto';

@Component({
  selector: 'attribute-select',
  templateUrl: './attribute-select.component.html',
  styleUrls: ['./attribute-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AttributeSelectComponent),
    multi: true
  }]
})
export class AttributeSelectComponent extends SelectComponent implements OnInit, ControlValueAccessor, OnDestroy {

  attribute: AttributeDto;
  lang = DEFAULT_LANG;

  isLoading: boolean = false;
  isAddValueControlVisible: boolean = false;
  isSuccessfullyAdded: boolean = false;

  labelControl: FormControl = new FormControl();
  searchControl: FormControl = new FormControl();
  filteredOptions: ISelectOption[];

  @Input('selectedAttr') productSelectedAttr: ProductSelectedAttributeDto;

  constructor(
    private attributeService: AttributeService,
    private notyService: NotyService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    if (!this.productSelectedAttr) {
      this.notyService.showErrorNoty(`[${AttributeSelectComponent.name}]: Input property 'productSelectedAttr' is mandatory`);
      throw new Error(`Input property 'productSelectedAttr' is mandatory`);
    }

    this.attributeService.attributes$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(attributes => {
        this.attribute = attributes.find(attr => this.productSelectedAttr.attributeId === attr.id);

        if (this.attribute) {
          this.options = this.attribute.values.map(value => ({ data: value.id, view: value.label[DEFAULT_LANG] })) || [];
          this.filteredOptions = this.options;
          if (this.attribute.type === EAttributeType.MultiSelect) {
            this.isMultiSelect = true;
          }
        }

        this.onSearchInputChange();
        this.markSelectedOptions();
        this.cdr.markForCheck();
      });
  }

  public toggleValueControlVisibility(isAddValueControlVisible: boolean = !this.isAddValueControlVisible) {
    const multiLingualTextDto = new MultilingualTextDto();
    multiLingualTextDto[DEFAULT_LANG] = this.searchControl.value;
    this.labelControl.setValue(multiLingualTextDto);

    this.isAddValueControlVisible = isAddValueControlVisible;
  }

  public addNewAttributeValue() {
    const attributeId = this.productSelectedAttr.attributeId;
    const attributeValueDto = new AttributeValueDto();
    attributeValueDto.label = this.labelControl.value;

    this.isLoading = true;

    this.attributeService.addAttributeValue(attributeId, attributeValueDto)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.isLoading = false))
      .subscribe(attribute => {
        this.isSuccessfullyAdded = true;

        setTimeout(() => {
          this.searchControl.setValue('');
          this.labelControl.setValue(new MultilingualTextDto());
          this.isAddValueControlVisible = false;
          this.isSuccessfullyAdded = false;

          this.cdr.detectChanges();
        }, 1000);
      });
  }

  private onSearchInputChange() {
    this.searchControl.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(value => {
        this.filterAttributeValues(value);
      });
  }

  private filterAttributeValues(value: string) {
    const searchAsRegEx = new RegExp(value, 'gi');
    this.filteredOptions = [];

    this.options.forEach(option => {
      const isOptionMatched = !!option.view.match(searchAsRegEx);

      if (isOptionMatched) {
        this.filteredOptions.push(option);
      }
    });
  }

  public toggleVisibility(isVisible: boolean = !this.isVisible) {
    super.toggleVisibility(isVisible);
    this.toggleValueControlVisibility(false);
  }
}
