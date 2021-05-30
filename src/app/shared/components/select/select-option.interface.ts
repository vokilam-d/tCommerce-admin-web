export interface ISelectOption<T = any> {
  value: T;
  view?: string;
  isSelected?: boolean;
}
