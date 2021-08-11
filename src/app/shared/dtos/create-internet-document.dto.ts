import { ShipmentPayerEnum } from '../enums/shipment-payer.enum';
import { ShipmentPaymentMethodEnum } from '../enums/shipment-payment-method.enum';

export class CreateInternetDocumentDto {
  senderId: number;
  trackingNumber: string;
  backwardMoneyDelivery: string;
  cost: number;
  description: string;
  height: string;
  length: string;
  payerType: ShipmentPayerEnum;
  paymentMethod: ShipmentPaymentMethodEnum;
  weight: string;
  width: string;
}
