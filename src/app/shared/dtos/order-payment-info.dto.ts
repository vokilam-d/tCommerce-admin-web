import { MultilingualTextDto } from './multilingual-text.dto';
import { PaymentMethodEnum } from '../enums/payment-method.enum';

export class OrderPaymentInfoDto {
  methodAdminName: MultilingualTextDto;
  methodClientName: MultilingualTextDto;
  methodId: string;
  type: PaymentMethodEnum;
}
