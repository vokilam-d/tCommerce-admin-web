import { ShipmentAddressDto } from './shipment-address.dto';
import { CustomerContactInfoDto } from './customer-contact-info.dto';
import { OrderItemDto } from './order-item.dto';

export class AddOrUpdateCustomerDto {
  contactInfo: CustomerContactInfoDto = new CustomerContactInfoDto();
  note: string = '';
  addresses: ShipmentAddressDto[] = [];
  discountPercent: number = 0;
}

export class CustomerDto {
  id: number;
  createdAt: Date = undefined;
  lastLoggedIn: Date = undefined;
  isLocked: boolean = false;
  isEmailConfirmed: boolean = false;
  isPhoneNumberConfirmed: boolean = false;
  deprecatedAddresses: string[] = [];
  storeReviewIds: number[] = [];
  productReviewIds: number[] = [];
  orderIds: number[] = [];
  wishlistProductIds: number[] = [];
  totalOrdersCost: number = 0;
  oauthId: string = undefined;
  isRegisteredByThirdParty: boolean = false;
  updatedAt: Date = undefined;
  totalOrdersCount: number = 0;
  cart: OrderItemDto[] = [];
}
