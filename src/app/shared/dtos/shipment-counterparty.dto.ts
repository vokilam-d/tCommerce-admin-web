import { ContactInfoDto } from './contact-info.dto';
import { ShipmentAddressDto } from './shipment-address.dto';

export class ShipmentCounterpartyDto {
  contactInfo: ContactInfoDto = new ContactInfoDto();
  address: ShipmentAddressDto = new ShipmentAddressDto();
}
