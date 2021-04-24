import { AddressTypeEnum } from '../enums/address-type.enum';

export class ShipmentAddressDto {
  isDefault: boolean = false;
  id?: string;
  settlementName: string = '';
  settlementNameFull: string = '';
  settlementId: string = '';
  type: AddressTypeEnum = AddressTypeEnum.WAREHOUSE;
  addressId?: string = '';
  addressName?: string = '';
  addressNameFull?: string = '';
  buildingNumber?: string = '';
  flat?: string = '';
}
