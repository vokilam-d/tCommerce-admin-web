import { MultilingualTextDto } from './multilingual-text.dto';
import { OrderItemDto } from './order-item.dto';
import { ShipmentDto } from './shipment.dto';
import { MediaDto } from './media.dto';
import { LogDto } from './log.dto';
import { CustomerContactInfoDto } from './customer-contact-info.dto';
import { ManagerDto } from './manager.dto';
import { OrderStatusEnum } from '../enums/order-status.enum';
import { OrderPricesDto } from './order-prices.dto';
import { OrderNotesDto } from './order-notes.dto';
import { OrderPaymentInfoDto } from './order-payment-info.dto';


export class OrderDto {
  id: number;
  idForCustomer: string;
  customerContactInfo: CustomerContactInfoDto;
  customerId: number;
  isCallbackNeeded: boolean;
  isOrderPaid: boolean;
  items: OrderItemDto[];
  logs: LogDto[];
  manager: ManagerDto;
  medias: MediaDto[];
  notes: OrderNotesDto;
  paymentInfo: OrderPaymentInfoDto;
  prices: OrderPricesDto;
  shipment: ShipmentDto;
  source: 'client' | 'manager';
  status: OrderStatusEnum;
  statusDescription: MultilingualTextDto;
  createdAt: Date;
  updatedAt: Date;
  shippedAt: Date;
}

export class UpdateOrderAdminNote {
  note: string;
}

export class UpdateOrderAdminManager {
  userId: string;
}
