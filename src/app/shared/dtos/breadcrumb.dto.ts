import { MultilingualTextDto } from './multilingual-text.dto';

export class BreadcrumbDto {
  id: number;
  name: MultilingualTextDto = new MultilingualTextDto();
  slug: string;
}
