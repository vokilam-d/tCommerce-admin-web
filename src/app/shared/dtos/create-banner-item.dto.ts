import { EBannerItemType } from '../enums/banner-item-type.enum';
import { MediaDto } from './media.dto';


export class CreateBannerItemDto {
  id?: number;
  type: EBannerItemType;
  slug?: string;
  media?: MediaDto;
}
