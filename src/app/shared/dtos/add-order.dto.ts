import { CustomerContactInfoDto } from './customer-contact-info.dto';
import { ContactInfoDto } from './contact-info.dto';
import { ShipmentAddressDto } from './shipment-address.dto';
import { OrderItemDto } from './order-item.dto';
import { ManagerDto } from './manager.dto';
import { OrderPricesDto } from './order-prices.dto';

export class AddOrderDto {
  id?: number;
  customerId: number;
  customerContactInfo: CustomerContactInfoDto = new CustomerContactInfoDto();
  recipientContactInfo: ContactInfoDto = new ContactInfoDto();
  address: ShipmentAddressDto = new ShipmentAddressDto();
  paymentMethodId: string;
  isCallbackNeeded: boolean = false;
  items: OrderItemDto[] = [];
  note: string = '';
  manager: ManagerDto = new ManagerDto();
  prices: OrderPricesDto = new OrderPricesDto();
}
