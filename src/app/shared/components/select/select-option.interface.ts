export interface ISelectOption<T = any, K = any> {
  value: T;
  view?: string;
  isSelected?: boolean;
  data?: K;
}
