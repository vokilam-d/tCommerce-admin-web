import { ECurrencyCode } from '../enums/currency.enum';
import { MultilingualTextDto } from './multilingual-text.dto';

export class CurrencyDto {
  id: ECurrencyCode;
  label: MultilingualTextDto = new MultilingualTextDto();
  exchangeRate: number;
  isDefault: boolean;
  updatedAt: Date;
}
