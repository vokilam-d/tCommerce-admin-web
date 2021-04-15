import { OrderItemDto } from './order-item.dto';
import { ShipmentDto } from './shipment.dto';
import { OrderStatusEnum } from '../enums/order-status.enum';
import { PaymentMethodEnum } from '../enums/payment-method.enum';
import { OrderPricesDto } from './order-prices.dto';
import { MultilingualTextDto } from './multilingual-text.dto';
import { LogDto } from './log.dto';
import { ManagerDto } from './manager.dto';
import { MediaDto } from './media.dto';

export class AddOrUpdateOrderDto {
  customerId: number;
  customerFirstName: string = '';
  customerLastName: string = '';
  customerEmail: string = '';
  customerPhoneNumber: string = '';
  customerNote: string = '';
  shipment: ShipmentDto = new ShipmentDto();
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
  manager: ManagerDto = new ManagerDto();
  isOrderPaid: boolean = false;
  logs: LogDto[];
  medias: MediaDto[];
}

export class OrderDto extends AddOrUpdateOrderDto {
  id: number;
  statusDescription: MultilingualTextDto = new MultilingualTextDto();
  source: 'client' | 'manager';
  shippedAt: Date;
}

export class UpdateOrderAdminNote {
  note: string;
}

export class UpdateOrderAdminManager {
  userId: string;
}
