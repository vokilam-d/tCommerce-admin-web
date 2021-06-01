import { AddOrUpdateProductVariantDto, ProductVariantDto } from './product-variant.dto';
import { ProductSelectedAttributeDto } from './selected-attribute.dto';
import { BreadcrumbDto } from './breadcrumb.dto';
import { ECurrencyCode } from '../enums/currency.enum';
import { MultilingualTextDto } from './multilingual-text.dto';
import { ProductLabelTypeEnum } from '../enums/product-label-type.enum';

export class ProductCategoryDto {
  id: number;
  name?: MultilingualTextDto = new MultilingualTextDto();
  slug?: string;
  reversedSortOrder?: number;
  isSortOrderFixed?: boolean;
}

export class AddOrUpdateProductDto {
  isEnabled: boolean = true;
  name: MultilingualTextDto = new MultilingualTextDto();
  categories: ProductCategoryDto[] = [];
  additionalServiceIds: number[] = [];
  breadcrumbs: BreadcrumbDto[] = [];
  attributes: ProductSelectedAttributeDto[] = [];
  variants: AddOrUpdateProductVariantDto[] = [new AddOrUpdateProductVariantDto()];
  reviewsCount: number;
  reviewsAvgRating: number;
  note: string = '';
}

export class ProductDto extends AddOrUpdateProductDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  variants: ProductVariantDto[] = [new ProductVariantDto()];
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
  categories: ProductCategoryDto[];
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
}
