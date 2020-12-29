import { EMediaVariant } from '../enums/media-variant.enum';
import { MultilingualTextDto } from './multilingual-text.dto';

type VariantsUrls = {
  [k in EMediaVariant]: string;
};

export class MediaDto {
  variantsUrls: VariantsUrls = {
    [EMediaVariant.Original]: '',
    [EMediaVariant.Large]: '',
    [EMediaVariant.Medium]: '',
    [EMediaVariant.Small]: '',
  };

  altText: MultilingualTextDto = new MultilingualTextDto();

  isHidden: boolean;

  size: string;

  dimensions: string;
}
