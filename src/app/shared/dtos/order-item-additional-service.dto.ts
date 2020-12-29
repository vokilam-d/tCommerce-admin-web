import { MultilingualTextDto } from './multilingual-text.dto';

export class OrderItemAdditionalServiceDto {
  id: number;
  name: MultilingualTextDto = new MultilingualTextDto();
  price: number;
}
