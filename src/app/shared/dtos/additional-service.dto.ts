import { MultilingualTextDto } from './multilingual-text.dto';

export class AdditionalServiceDto {
  id: number;
  name: MultilingualTextDto = new MultilingualTextDto();
  clientName: MultilingualTextDto = new MultilingualTextDto();
  isEnabled: boolean = true;
  price: number = 0;
}
