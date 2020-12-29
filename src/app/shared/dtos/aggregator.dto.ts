import { MultilingualTextDto } from './multilingual-text.dto';

export class AggregatorDto {
  id: number;
  name: MultilingualTextDto = new MultilingualTextDto();
  clientName: MultilingualTextDto = new MultilingualTextDto();
  isVisibleOnProductPage: boolean = true;
  productIds: number[] = [];
}
