import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CategoryTreeItem } from '../shared/dtos/category.dto';
import { ResponseDto } from '../shared/dtos/response.dto';
import { API_HOST, DEFAULT_LANG } from '../shared/constants/constants';
import { ProductCategoryDto } from '../shared/dtos/product.dto';
import { NotyService } from '../noty/noty.service';
import { toHttpParams } from '../shared/helpers/to-http-params.function';

type CategorySelectOption = CategoryTreeItem & { isSelected: boolean; children: CategorySelectOption[]; };

@Component({
  selector: 'product-category-select',
  templateUrl: './product-category-select.component.html',
  styleUrls: ['./product-category-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ProductCategorySelectComponent),
    multi: true
  }]
})
export class ProductCategorySelectComponent implements OnInit, ControlValueAccessor {

  isVisible: boolean = false;
  isDisabled: boolean = false;
  options: CategorySelectOption[] = [];
  lang = DEFAULT_LANG;

  private _value: ProductCategoryDto[];

  get value(): ProductCategoryDto[] {
    const selected = [];
    const populate = (options: CategorySelectOption[]) => {
      options.forEach(option => {
        if (option.isSelected) {
          const savedValue = this._value.find(category => category.id === option.id);
          selected.push(savedValue ? savedValue : { id: option.id, name: option.name, slug: option.slug });
        }
        populate(option.children);
      });
    };

    populate(this.options);
    return selected;
  }

  set value(categories: ProductCategoryDto[]) {
    this._value = categories;
    this.setOptionsSelectedState(this.options);
    this.onChange(categories);
    this.onTouched();
  }

  constructor(
    private http: HttpClient,
    private notyService: NotyService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    setTimeout(() => this.init());
  }

  private init() {
    const params = toHttpParams({ noClones: true });
    this.http.get<ResponseDto<CategoryTreeItem[]>>(`${API_HOST}/api/v1/admin/categories/tree`, { params })
      .pipe( this.notyService.attachNoty() )
      .subscribe(
        response => {
          this.options = this.buildOptions(response.data);
          this.cdr.markForCheck();
        },
        error => console.warn(error)
      );
  }

  onChange = (_: any) => {};

  onTouched = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(value: ProductCategoryDto[]): void {
    if (value === null) {
      value = [];
    }

    if (!Array.isArray(value)) {
      throw new Error(`Value for ${ProductCategorySelectComponent.name} must be an array`);
    }

    this.value = value;
    this.setOptionsSelectedState(this.options);
  }

  toggleOption(option: CategorySelectOption, isSelected = !option.isSelected) {
    option.isSelected = isSelected;

    if (option.isSelected) {
      let parentId: number = option.parentId;
      while (parentId > 0) {
        const parent = this.findOptionById(parentId);
        parent.isSelected = option.isSelected;
        parentId = parent.parentId;
      }
    }

    this.onChange(this.value);
    this.onTouched();
  }

  unselectOption(event: Event, category: ProductCategoryDto) {
    event.stopPropagation();
    const option = this.findOptionById(category.id);
    this.toggleOption(option, false);
  }

  toggleVisibility(isVisible = !this.isVisible) {
    this.isVisible = isVisible;
  }

  private buildOptions(categories: CategoryTreeItem[]): CategorySelectOption[] {
    return categories.map(({ children, ...restCategory }) => {
      const isSelected = !!this._value.find(category => category.id === restCategory.id);
      return {
        ...restCategory,
        children: this.buildOptions(children),
        isSelected
      }
    });
  }

  private setOptionsSelectedState(options: CategorySelectOption[]): void {
    options.forEach(option => {
      option.isSelected = !!this._value.find(category => category.id === option.id);
      this.setOptionsSelectedState(option.children);
    });
  }

  private findOptionById(id: number): CategorySelectOption {
    const findOption = (options) => {
      for (const option of options) {
        if (option.id === id) {
          return option;
        }
        if (option.children?.length) {
          const found = findOption(option.children);
          if (found) {
            return found;
          }
        }
      }
    }

    return findOption(this.options);
  }
}
