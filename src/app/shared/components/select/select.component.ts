import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { ISelectOption } from './select-option.interface';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgUnsubscribe } from '../../directives/ng-unsubscribe/ng-unsubscribe.directive';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectComponent),
    multi: true
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent extends NgUnsubscribe implements OnInit, OnChanges, ControlValueAccessor {

  isVisible: boolean = false;

  protected value: any | any[];

  @Input() isDisabled: boolean = false;
  @Input() hasEmpty: boolean = false;
  @Input() options: ISelectOption[] = [];
  @Input() isMultiSelect: boolean = false;
  @Input() isSizeSmall: boolean = false;
  @Input() initialValue: any | any[];
  @Output() select: EventEmitter<any> = new EventEmitter();

  get activeOptionLabel(): string {
    const selectedOptions = this.options.filter(option => option.isSelected);

    if (selectedOptions.length) {
      return selectedOptions.map(option => option.view || option.data).join(', ');
    } else {
      return '- Не выбрано -';
    }
  };

  constructor() {
    super();
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.options) {
      if (changes.options.firstChange && this.initialValue) {
        this.value = this.initialValue;
      }

      if (changes.options.currentValue) {
        this.markSelectedOptions();
      }
    }
  }

  onChange = (_: any) => {
    this.markSelectedOptions();
  };

  onTouched = () => {};

  registerOnChange(fn: any): void {
    this.onChange = value => {
      fn(value);
      this.markSelectedOptions();
    };
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(value: any): void {
    this.value = value;
    this.onChange(value);
    this.select.emit(value);
  }

  selectOption(option: ISelectOption) {
    let newValue;
    if (this.isMultiSelect) {
      newValue = (this.value as any[]).slice(); // copy array
      const idxInValue = newValue.indexOf(option.data);
      if (idxInValue === -1) {
        newValue.push(option.data);
      } else {
        newValue.splice(idxInValue, 1);
      }
    } else {
      this.options.forEach(option => option.isSelected = false);
      newValue = option.data;
      this.toggleVisibility(false);
    }

    option.isSelected = !option.isSelected;

    this.writeValue(newValue);
    this.onTouched();
  }

  selectEmptyOption() {
    this.selectOption(this.getEmptyOption());
  }

  toggleVisibility(isVisible: boolean = !this.isVisible) {
    if (this.isDisabled) {
      return;
    }

    this.isVisible = isVisible;
  }

  private getEmptyOption(): ISelectOption {
    return {
      data: undefined
    };
  }

  protected markSelectedOptions() {
    for (const option of this.options) {
      if (Array.isArray(this.value)) {
        option.isSelected = this.value.includes(option.data);
      } else {
        option.isSelected = option.data === this.value;
      }
    }
  }
}
