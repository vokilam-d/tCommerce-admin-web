import { MetaTagsDto } from './meta-tags.dto';
import { MediaDto } from './media.dto';
import { LinkedProductDto } from './linked-product.dto';
import { MultilingualTextDto } from './multilingual-text.dto';

export class LinkedBlogCategoryDto {
  id: number;
  name: MultilingualTextDto = new MultilingualTextDto();
  slug: string;
}

export class LinkedBlogPostDto {
  id: number;
  name: MultilingualTextDto = new MultilingualTextDto();
  slug: string;
  sortOrder: number;
}

export class BlogPostCreateDto {
  name: MultilingualTextDto = new MultilingualTextDto();
  slug: string = '';
  category: LinkedBlogCategoryDto;
  content: MultilingualTextDto = new MultilingualTextDto();
  shortContent: MultilingualTextDto = new MultilingualTextDto();
  createdAt: Date = new Date();
  publishedAt: Date = new Date();
  updatedAt: Date = new Date();
  isEnabled: boolean = true;
  linkedPosts: LinkedBlogPostDto[] = [];
  linkedProducts: LinkedProductDto[] = [];
  medias: MediaDto[] = [];
  metaTags: MetaTagsDto = new MetaTagsDto();
  sortOrder: number = 0;
  featuredMedia: MediaDto;
}

export class BlogPostDto extends BlogPostCreateDto {
  id: number;
}

