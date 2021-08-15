import { AddOrUpdateProductVariantDto, ProductVariantDto } from './product-variant.dto';
import { ProductSelectedAttributeDto } from './selected-attribute.dto';
import { ECurrencyCode } from '../enums/currency.enum';
import { MultilingualTextDto } from './multilingual-text.dto';
import { ProductLabelTypeEnum } from '../enums/product-label-type.enum';
import { BreadcrumbsVariantDto } from './breadcrumbs-variant.dto';
import { LogDto } from './log.dto';

export class ProductCategoryDto {
  id: number;
  reversedSortOrder?: number;
  reversedSortOrderBeforeFix?: number;
  isSortOrderFixed?: boolean;
}

export class ProductListItemCategoryDto extends ProductCategoryDto {
  name: string;
  slug: string;
}

export class AddOrUpdateProductDto {
  isEnabled: boolean = true;
  name: MultilingualTextDto = new MultilingualTextDto();
  categories: ProductCategoryDto[] = [];
  additionalServiceIds: number[] = [];
  breadcrumbsVariants: BreadcrumbsVariantDto[] = [];
  attributes: ProductSelectedAttributeDto[] = [];
  variants: AddOrUpdateProductVariantDto[] = [new AddOrUpdateProductVariantDto()];
  reviewsCount: number;
  reviewsAvgRating: number;
  note: string = '';
  supplierId: number;
}

export class ProductDto extends AddOrUpdateProductDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  variants: ProductVariantDto[] = [new ProductVariantDto()];
  logs: LogDto[] = [];
}

export class ProductVariantListItemDto {
  id: string;
  isEnabled: boolean;
  attributes: ProductSelectedAttributeDto[];
  mediaUrl: string;
  name: MultilingualTextDto;
  sku: string;
  gtin: string;
  vendorCode: string;
  price: number;
  oldPrice: number;
  currency: ECurrencyCode;
  priceInDefaultCurrency: number;
  oldPriceInDefaultCurrency: number;
  qtyInStock: number;
  sellableQty: number;
  salesCount: number;
  isIncludedInShoppingFeed: boolean;
}

export class ProductListItemDto {
  id: number;
  categories: ProductListItemCategoryDto[];
  attributes: ProductSelectedAttributeDto[];
  mediaUrl: string;
  label: ProductLabelTypeEnum;
  name: MultilingualTextDto = new MultilingualTextDto();
  skus: string;
  gtins: string;
  currency: ECurrencyCode;
  vendorCodes: string;
  prices: string;
  quantitiesInStock: string;
  sellableQuantities: string;
  isEnabled: boolean;
  variants?: ProductVariantListItemDto[];
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
  note: string;
  isIncludedInShoppingFeed: boolean;
  supplierId: number;
  isInStock: boolean;
  isSellable: boolean;
}
