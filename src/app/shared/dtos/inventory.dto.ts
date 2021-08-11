import { LogDto } from './log.dto';
import { ReservedInventoryDto } from './reserved-inventory.dto';

export class InventoryDto {
  productId: number;
  qtyInStock: number;
  sellableQty: number;
  sku: string;
  logs: LogDto[];
  reserved: ReservedInventoryDto[];
}
