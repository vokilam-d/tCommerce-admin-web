import { OrderItemDto } from './order-item.dto';
import { ShipmentDto } from './shipment.dto';
import { OrderStatusEnum } from '../enums/order-status.enum';
import { PaymentMethodEnum } from '../enums/payment-method.enum';
import { OrderPricesDto } from './order-prices.dto';
import { MultilingualTextDto } from './multilingual-text.dto';
import { LogDto } from './log.dto';

export class AddOrUpdateOrderDto {
  customerId: number;
  customerFirstName: string = '';
  customerLastName: string = '';
  customerEmail: string = '';
  customerPhoneNumber: string = '';
  customerNote: string = '';
  shipment: ShipmentDto = new ShipmentDto();
  shouldSaveAddress: boolean = true;
  createdAt: Date;
  isConfirmationEmailSent: boolean = false;
  paymentType: PaymentMethodEnum;
  paymentMethodId: string;
  paymentMethodAdminName: MultilingualTextDto = new MultilingualTextDto();
  paymentMethodClientName: MultilingualTextDto = new MultilingualTextDto();
  shippingMethodName: MultilingualTextDto = new MultilingualTextDto();
  isCallbackNeeded: boolean = false;
  items: OrderItemDto[] = [];
  status: OrderStatusEnum = OrderStatusEnum.NEW;
  clientNote: string = '';
  adminNote: string = '';
  prices: OrderPricesDto = new OrderPricesDto();
  isOrderPaid: boolean = false;
  logs: LogDto[];
}

export class OrderDto extends AddOrUpdateOrderDto {
  id: number;
  statusDescription: MultilingualTextDto = new MultilingualTextDto();
  source: 'client' | 'manager';
}

export class UpdateOrderAdminNote {
  adminNote: string;
}
