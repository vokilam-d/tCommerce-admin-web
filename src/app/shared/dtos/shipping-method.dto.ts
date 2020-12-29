import { MultilingualTextDto } from './multilingual-text.dto';

export class ShippingMethodDto {
  id?: string;
  isEnabled: boolean = true;
  clientName: MultilingualTextDto = new MultilingualTextDto();
  adminName: MultilingualTextDto = new MultilingualTextDto();
  price: number = 0;
  sortOrder: number = 0;
}
