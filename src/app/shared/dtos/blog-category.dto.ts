import { MetaTagsDto } from './meta-tags.dto';
import { MultilingualTextDto } from './multilingual-text.dto';

export class BlogCategoryCreateDto {
  id?: any;
  content: MultilingualTextDto = new MultilingualTextDto();
  isEnabled: boolean;
  metaTags: MetaTagsDto;
  name: MultilingualTextDto = new MultilingualTextDto();
  slug: string;
  sortOrder: number;
}

export class BlogCategoryDto extends BlogCategoryCreateDto {
  id: number;
}
