import { MultilingualTextDto } from './multilingual-text.dto';

export class OrderPricesDto {
  discountPercent: number = 0;
  discountValue: number = 0;
  discountLabel: MultilingualTextDto = new MultilingualTextDto();
  itemsCost: number = 0;
  totalCost: number = 0;
}
