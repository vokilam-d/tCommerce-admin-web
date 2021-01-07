import { ShipmentTypeEnum } from '../enums/shipment-type.enum';
import { ShipmentPayerEnum } from '../enums/shipment-payer.enum';
import { ShipmentPaymentMethodEnum } from '../enums/shipment-payment-method.enum';
import { ShipmentStatusEnum } from '../enums/shipment-status.enum';
import { ShipmentAddressDto } from './shipment-address.dto';

export class ShipmentDto {
  trackingNumber?: string = '';
  estimatedDeliveryDate?: string = '';
  status?: ShipmentStatusEnum;
  statusDescription?: string = '';
  senderId: number = null;
  recipient?: ShipmentAddressDto = new ShipmentAddressDto();
  shipmentType?: ShipmentTypeEnum = ShipmentTypeEnum.WAREHOUSE_WAREHOUSE;
  payerType?: ShipmentPayerEnum;
  paymentMethod?: ShipmentPaymentMethodEnum = ShipmentPaymentMethodEnum.CASH;
  date?: string = '';
  weight?: string = '';
  length?: string = '';
  width?: string = '';
  height?: string = '';
  backwardMoneyDelivery?: string = '';
  cost?: string = '';
  description?: string = '';
}
