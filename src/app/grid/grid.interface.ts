import { IPagination } from '../pagination/pagination.interface';
import { ISelectOption } from '../shared/components/select/select-option.interface';

export interface IGridFilter {
  fieldName: string;
  value: string | string[];
}

export interface IGridValue extends IPagination {
  sort?: string;
  filters?: IGridFilter[]; // rm '?'
}

export interface IGridCell {
  label: string;
  placeholder?: string;
  align: 'center' | 'left' | 'right';
  fieldName: string;
  isSortable?: boolean;
  isSearchable?: boolean;
  initialWidth: number;
  isImage?: boolean;
  filterFields?: ISelectOption[];
  filterFieldName?: string;
  hasDateFromFilter?: boolean;
  hasDateToFilter?: boolean;
}
