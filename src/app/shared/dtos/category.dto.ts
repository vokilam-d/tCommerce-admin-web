import { MetaTagsDto } from './meta-tags.dto';
import { MediaDto } from './media.dto';
import { EProductsSort } from '../enums/product-sort.enum';
import { MultilingualTextDto } from './multilingual-text.dto';

export class AddOrUpdateCategoryDto {
  isEnabled: boolean = true;
  name: MultilingualTextDto = new MultilingualTextDto();
  canonicalCategoryId: number = null;
  description: MultilingualTextDto = new MultilingualTextDto();
  slug: string = '';
  createRedirect: boolean = false;
  parentId: number = 0;
  metaTags: MetaTagsDto = new MetaTagsDto();
  medias: MediaDto[] = [];
  defaultItemsSort: EProductsSort = EProductsSort.Popularity;
}

export class CategoryDto extends AddOrUpdateCategoryDto {
  id?: number;
}

export class CategoryTreeItem {
  id: CategoryDto['id'];
  name: CategoryDto['name'];
  slug: CategoryDto['slug'];
  parentId: CategoryDto['parentId'];
  children: CategoryTreeItem[];
  medias: MediaDto[];
}

