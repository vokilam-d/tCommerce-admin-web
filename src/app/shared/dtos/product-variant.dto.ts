import { ProductSelectedAttributeDto } from './selected-attribute.dto';
import { MediaDto } from './media.dto';
import { MetaTagsDto } from './meta-tags.dto';
import { DEFAULT_CURRENCY_CODE, ECurrencyCode } from '../enums/currency.enum';
import { LinkedProductDto } from './linked-product.dto';
import { MultilingualTextDto } from './multilingual-text.dto';

export class AddOrUpdateProductVariantDto {
  name: MultilingualTextDto = new MultilingualTextDto();
  createRedirect: boolean;
  vendorCode: string = '';
  gtin: string = '';
  slug: string = '';
  attributes: ProductSelectedAttributeDto[] = [];
  isEnabled: boolean = true;
  price: number = 0;
  oldPrice: number;
  currency: ECurrencyCode = DEFAULT_CURRENCY_CODE;
  medias: MediaDto[] = [];
  fullDescription: MultilingualTextDto = new MultilingualTextDto();
  shortDescription: MultilingualTextDto = new MultilingualTextDto();
  metaTags: MetaTagsDto = new MetaTagsDto();
  qtyInStock: number = 0;
  isDiscountApplicable: boolean = true;
  isIncludedInShoppingFeed: boolean = true;
  googleAdsProductTitle: string = '';
  relatedProducts: LinkedProductDto[] = [];
  crossSellProducts: LinkedProductDto[] = [];
}

export class ProductVariantDto extends AddOrUpdateProductVariantDto {
  id: string;
  sku: string;
  priceInDefaultCurrency: number;
  oldPriceInDefaultCurrency: number;
  sellableQty: number;
  salesCount: number;
}
