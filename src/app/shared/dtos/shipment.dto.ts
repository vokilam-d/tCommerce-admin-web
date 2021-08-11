import { ShipmentPayerEnum } from '../enums/shipment-payer.enum';
import { ShipmentStatusEnum } from '../enums/shipment-status.enum';
import { MultilingualTextDto } from './multilingual-text.dto';
import { ShipmentCounterpartyDto } from './shipment-counterparty.dto';
import { ShipmentPaymentMethodEnum } from '../enums/shipment-payment-method.enum';

export class ShipmentDto {
  trackingNumber: string = '';
  estimatedDeliveryDate: string = '';
  status: ShipmentStatusEnum = undefined;
  statusDescription: string = undefined;
  sender: ShipmentCounterpartyDto = new ShipmentCounterpartyDto();
  recipient: ShipmentCounterpartyDto = new ShipmentCounterpartyDto();
  shippingMethodDescription: MultilingualTextDto = new MultilingualTextDto();
  payerType: ShipmentPayerEnum = undefined;
  weight: string = '';
  length: string = '';
  width: string = '';
  height: string = '';
  backwardMoneyDelivery: string = '';
  cost: string = '';
  description: string = '';
  paidStorageStartDate: string = '';
  paymentMethod: ShipmentPaymentMethodEnum = undefined;
}
