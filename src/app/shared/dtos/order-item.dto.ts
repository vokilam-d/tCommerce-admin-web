import { OrderItemAdditionalServiceDto } from './order-item-additional-service.dto';
import { MultilingualTextDto } from './multilingual-text.dto';

export class OrderItemDto {
  name: MultilingualTextDto = new MultilingualTextDto();
  productId: number = 0;
  variantId: string = '';
  sku: string = '';
  vendorCode: string = '';
  price: number = 0;
  oldPrice: number = 0;
  qty: number = 0;
  cost: number = 0;
  oldCost: number = 0;
  imageUrl: string = '';
  additionalServices: OrderItemAdditionalServiceDto[] = [];
  isPacked: boolean;
}
