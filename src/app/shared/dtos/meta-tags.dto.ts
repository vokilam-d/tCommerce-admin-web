import { MultilingualTextDto } from './multilingual-text.dto';

export class MetaTagsDto {
  title: MultilingualTextDto = new MultilingualTextDto();
  keywords: MultilingualTextDto = new MultilingualTextDto();
  description: MultilingualTextDto = new MultilingualTextDto();
}
