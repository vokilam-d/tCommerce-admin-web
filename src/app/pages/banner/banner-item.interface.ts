import { ProductVariantListItemDto } from '../../shared/dtos/product.dto';
import { BlogPostDto } from '../../shared/dtos/blog-post.dto';

export interface IBannerItem {
  item: ProductVariantListItemDto | BlogPostDto;
  type: string;
}
