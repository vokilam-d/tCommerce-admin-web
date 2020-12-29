import { EAttributeType } from '../enums/attribute-type.enum';
import { MultilingualTextDto } from './multilingual-text.dto';

export class AttributeValueDto {
  id: string = '';
  label: MultilingualTextDto = new MultilingualTextDto();
  color?: string = '';
  isDefault: boolean = false;
}

export class UpdateAttributeDto {
  label: MultilingualTextDto = new MultilingualTextDto();
  values: AttributeValueDto[] = [];
  isVisibleInProduct: boolean = true;
  isVisibleInFilters: boolean = true;
  hasColor: boolean = false;
}

export class CreateAttributeDto extends UpdateAttributeDto {
  id: string = '';
  type: EAttributeType = EAttributeType.Select;
}

export class AttributeDto extends CreateAttributeDto {
}
