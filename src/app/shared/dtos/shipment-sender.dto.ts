import { AddressTypeEnum } from '../enums/address-type.enum';

export class ShipmentSenderDto {
  id?: number;
  addressType?: AddressTypeEnum;
  city?: string;
  cityId?: string;
  senderId?: string;
  contactId?: string;
  counterpartyRef?: string;
  addressId?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  buildingNumber?: string;
  flat?: string;
  isDefault?: boolean;
  isFop?: boolean;
}
