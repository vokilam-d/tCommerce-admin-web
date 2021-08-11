import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { AttributeService } from '../../../shared/services/attribute.service';
import { AttributeDto, AttributeValueDto } from '../../../shared/dtos/attribute.dto';
import { AddOrUpdateProductVariantDto } from '../../../shared/dtos/product-variant.dto';
import { AddOrUpdateProductDto } from '../../../shared/dtos/product.dto';
import { NgUnsubscribe } from '../../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { finalize, takeUntil } from 'rxjs/operators';
import { EAttributeType } from '../../../shared/enums/attribute-type.enum';
import { IGridCell, IGridValue } from '../../../grid/grid.interface';
import { NotyService } from '../../../noty/noty.service';
import { getPropertyOf } from '../../../shared/helpers/get-property-of.function';
import { ProductSelectedAttributeDto } from '../../../shared/dtos/selected-attribute.dto';
import { DEFAULT_LANG } from '../../../shared/constants/constants';
import { MultilingualTextDto } from '../../../shared/dtos/multilingual-text.dto';
import { ISelectOption } from '../../../shared/components/select/select-option.interface';

enum ESelectionStep {
  SelectAttributes,
  AttributeValues,
  // Images,
  Summary
}

class SelectedAttributeValue extends AttributeValueDto {
  isSelected: boolean;
}

class SelectedAttribute extends AttributeDto {
  values: SelectedAttributeValue[];
  newValueName?: MultilingualTextDto;
}

interface ITruncatedVariant {
  [attrId: string]: SelectedAttributeValue['id'];
}

interface IVariantToUpdate {
  oldVariant: ITruncatedVariant;
  oldVariantIndex: number;
  newVariant: ITruncatedVariant;
  newVariantIndex: number;
  areSame: boolean;
}

@Component({
  selector: 'attributes-editor',
  templateUrl: './attributes-editor.component.html',
  styleUrls: ['./attributes-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttributesEditorComponent extends NgUnsubscribe implements OnInit {

  lang = DEFAULT_LANG;
  isVisible: boolean = false;
  activeStep: ESelectionStep = ESelectionStep.SelectAttributes;
  attributes: AttributeDto[] = [];
  selectedAttributes: SelectedAttribute[] = [];
  isLoading: boolean = false;

  attributesForProduct: AttributeDto[] = [];

  stepsEnum = ESelectionStep;
  attrTypeEnum = EAttributeType;

  itemsTotal: number = 0;
  itemsFiltered: number;
  pagesTotal: number = 1;
  isGridLoading: boolean = false;
  gridCells: IGridCell[] = attributeGridCells;

  toAddVariants: ITruncatedVariant[] = [];
  toUpdateVariants: IVariantToUpdate[] = [];
  toDeleteVariantIndices = new Set<number>();
  toAddVariantsCopyMap: {[toAddVariantIndex: number]: number} = {};

  @Input() initialFormValue: AddOrUpdateProductDto;
  @Input() isSelectManufacturerAttr: boolean = false;
  @Output('generated') generatedEmitter = new EventEmitter<AddOrUpdateProductDto>();

  get selectOptionsForCopy(): ISelectOption[] {
    return this.initialFormValue.variants.map((variant, index) => ({
      value: index,
      view: variant.name[this.lang]
    }));
  }

  constructor(
    public attributeService: AttributeService,
    private notyService: NotyService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this.attributeService.attributes$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(attributes => {
        this.selectedAttributes = [];
        this.attributes = this.transformResponse(attributes);
        this.itemsTotal = this.attributes.length;

        if (this.isSelectManufacturerAttr) {
          this.selectManufacturerAttribute();
        }

        this.cdr.markForCheck();
      });
  }

  show() {
    this.isVisible = true;
    this.attributes = [];
    this.attributeService.setAttributes();
  }

  hide() {
    this.isVisible = false;
    this.resetPreGenerated();
    this.activeStep = ESelectionStep.SelectAttributes;
  }

  private resetPreGenerated() {
    this.attributesForProduct = [];
  }

  prevStep() {
    if (this.activeStep === ESelectionStep.SelectAttributes) {
      return;
    }

    --this.activeStep;
  }

  nextStep() {
    if (this.activeStep === ESelectionStep.Summary) {
      this.finish();
      return;
    }

    ++this.activeStep;

    if (this.activeStep === ESelectionStep.Summary) {
      this.preGenerateVariants();

      if (this.toUpdateVariants.length === 1 && !this.toAddVariants.length && !this.toDeleteVariantIndices.size) {
        this.nextStep();
      }
    }
  }

  private preGenerateVariants() {
    this.resetPreGenerated();

    const attributesForVariants: AttributeDto[] = [];
    const attributeIdsForVariantsWithSingleValue: string[] = [];
    const selectedAttributesWithSelectedValues: SelectedAttribute[] = this.selectedAttributes.map(attr => {
      return { ...attr, values: attr.values.filter(v => v.isSelected) };
    });

    selectedAttributesWithSelectedValues.forEach(selectedAttr => {
      if (selectedAttr.type === EAttributeType.MultiSelect) {
        this.attributesForProduct.push(selectedAttr);
      } else {
        attributesForVariants.push(selectedAttr);

        if (selectedAttr.values.length === 1) {
          attributeIdsForVariantsWithSingleValue.push(selectedAttr.id);
          this.attributesForProduct.push(selectedAttr);
        }
      }
    });


    const truncNewVariants: ITruncatedVariant[] = [];
    const attributeValuesIndices = new Array(attributesForVariants.length).fill(0);

    const addVariant = () => {
      const truncNewVariant: { [attr: string]: string } = {};
      attributeValuesIndices.forEach((valueIndex, attributeIndex) => {
        const attribute = attributesForVariants[attributeIndex];
        const value = attribute?.values[valueIndex];
        if (value) {
          truncNewVariant[attribute.id] = value.id;
        }
      });
      truncNewVariants.push(truncNewVariant);
    };

    const incrementIndices = (attributeIndex: number = 0): boolean => {
      const attribute = attributesForVariants[attributeIndex];
      if (!attribute) {
        return false;
      }

      const incrementedValueIndex = attributeValuesIndices[attributeIndex] += 1;
      const value = attribute.values[incrementedValueIndex];
      if (!value) {
        attributeValuesIndices[attributeIndex] = 0;
        return incrementIndices(attributeIndex + 1);
      } else {
        return true;
      }
    };

    do {
      addVariant();
    } while (incrementIndices());


    const truncOldVariants: ITruncatedVariant[] = [];
    const nonMultiSelectProductSelectedAttrs = [];
    this.initialFormValue.attributes.forEach(selectedAttr => {
      const attr = this.attributes.find(attribute => attribute.id === selectedAttr.attributeId);
      if (!attr || attr.type === EAttributeType.MultiSelect) {
        return;
      }
      nonMultiSelectProductSelectedAttrs.push(selectedAttr);
    });
    this.initialFormValue.variants.forEach(variant => {
      const truncOldVariant: { [attr: string]: string } = {};
      [...nonMultiSelectProductSelectedAttrs, ...variant.attributes].forEach(selectedAttribute => {
        selectedAttribute.valueIds.forEach(selectedAttrValue => {
          truncOldVariant[selectedAttribute.attributeId] = selectedAttrValue;
        });
      });

      truncOldVariants.push(truncOldVariant);
    });

    const toUpdateVariantIndices = new Map<number, number>();
    const toAddVariantIndices = new Set<number>();
    this.toDeleteVariantIndices.clear();

    truncOldVariants.forEach((truncOldVariant, oldIndex) => {
      let willBeIndex = null;
      for (let newIndex = 0; newIndex < truncNewVariants.length; newIndex++){
        const isClone = Object.entries(truncOldVariant).every(([attrId, valueId]) => {
          return truncNewVariants[newIndex][attrId] === valueId;
        });
        if (isClone) {
          willBeIndex = newIndex;
          break;
        }
      }

      if (willBeIndex === null) {
        this.toDeleteVariantIndices.add(oldIndex);
      } else {
        toUpdateVariantIndices.set(oldIndex, willBeIndex);
      }
    });

    truncNewVariants.forEach((truncNewVariant, newIndex) => {
      let wasIndex = null;
      for (let oldIndex = 0; oldIndex < truncOldVariants.length; oldIndex++){
        const truncOldVariant = truncOldVariants[oldIndex];
        const isClone = Object.entries(truncOldVariant).every(([attrId, valueId]) => {
          return truncNewVariant[attrId] === valueId;
        });
        if (isClone) {
          wasIndex = oldIndex;
          break;
        }
      }

      if (wasIndex === null || toUpdateVariantIndices.get(wasIndex) !== newIndex) {
        toAddVariantIndices.add(newIndex);
      } else {
        toUpdateVariantIndices.set(wasIndex, newIndex);
      }
    });

    this.toDeleteVariantIndices.forEach(toDeleteVariantIndex => {
      if (toAddVariantIndices.size) {
        const toAddVariantIndex = toAddVariantIndices.values().next().value;
        toAddVariantIndices.delete(toAddVariantIndex);
        this.toDeleteVariantIndices.delete(toDeleteVariantIndex);

        toUpdateVariantIndices.set(toDeleteVariantIndex, toAddVariantIndex);
      }
    });

    const getTruncVariantWithoutSingleValueAttrs = (truncVariants: ITruncatedVariant[], truncVariantIndex: number): ITruncatedVariant => {
      const truncVariant = truncVariants[truncVariantIndex];
      const filteredTruncVariant: ITruncatedVariant = { };
      Object.keys(truncVariant).forEach(attributeId => {
        if (attributeIdsForVariantsWithSingleValue.includes(attributeId)) {
          return;
        }

        filteredTruncVariant[attributeId] = truncVariant[attributeId];
      });

      return filteredTruncVariant;
    };

    this.toAddVariants = [];
    toAddVariantIndices.forEach(toAddVariantIndex => {
      if (this.toDeleteVariantIndices.size) {
        const toDeleteVariantIndex = this.toDeleteVariantIndices.values().next().value;
        this.toDeleteVariantIndices.delete(toDeleteVariantIndex);
        toAddVariantIndices.delete(toAddVariantIndex);
        toUpdateVariantIndices.set(toDeleteVariantIndex, toAddVariantIndex);
      } else {
        const filteredTruncVariant = getTruncVariantWithoutSingleValueAttrs(truncNewVariants, toAddVariantIndex);

        this.toAddVariants.push(filteredTruncVariant);
      }
    });

    this.toUpdateVariants = [];
    toUpdateVariantIndices.forEach((newVariantIndex, oldVariantIndex) => {
      const filteredOldTruncVariant = getTruncVariantWithoutSingleValueAttrs(truncOldVariants, oldVariantIndex);
      const filteredNewTruncVariant = getTruncVariantWithoutSingleValueAttrs(truncNewVariants, newVariantIndex);
      let areSame: boolean = false;
      const oldEntries = Object.entries(filteredOldTruncVariant);
      const newEntries = Object.entries(filteredNewTruncVariant);
      if (oldEntries.length === newEntries.length) {
        areSame = oldEntries.every(([oldAttrId, oldValueId]) => {
          return newEntries.find(([newAttrId, newValueId]) => {
            return oldAttrId === newAttrId && oldValueId === newValueId
          });
        });
      }

      this.toUpdateVariants.push({
        oldVariant: filteredOldTruncVariant,
        newVariant: filteredNewTruncVariant,
        oldVariantIndex,
        newVariantIndex,
        areSame
      });
    });

    console.log({
      attributesForProduct: this.attributesForProduct,
      attributesForVariants: attributesForVariants,
      truncOldVariants: truncOldVariants,
      truncNewVariants,
      toAddVariantIndices,
      toAddVariants: this.toAddVariants,
      toUpdateVariants: this.toUpdateVariants,
      toUpdateVariantIndices,
      toDeleteVariantIndices: this.toDeleteVariantIndices,
    });
  }

  private finish() {
    const getStringCopy = (str: string): string => str?.trim() ? `КОПИЯ - ${str}` : ``;
    const getMultilangTextCopy = (text: MultilingualTextDto): MultilingualTextDto => {
      const copy = new MultilingualTextDto();
      Object.entries(text).forEach(([lang, value]) => copy[lang] = getStringCopy(value));
      return copy;
    };
    const getVariantCopy = (idx: number | undefined) => {
      if (idx === undefined) {
        idx = 0;
      }

      const variantClone: AddOrUpdateProductVariantDto = JSON.parse(JSON.stringify(this.initialFormValue.variants[idx]));
      return {
        name: getMultilangTextCopy(variantClone.name),
        price: variantClone.price,
        oldPrice: variantClone.oldPrice,
        qtyInStock: variantClone.qtyInStock,
        isIncludedInShoppingFeed: variantClone.isIncludedInShoppingFeed,
        isEnabled: variantClone.isEnabled,
        googleAdsProductTitle: getMultilangTextCopy(variantClone.googleAdsProductTitle),
        isDiscountApplicable: variantClone.isDiscountApplicable,
        vendorCode: getStringCopy(variantClone.vendorCode),
        gtin: getStringCopy(variantClone.gtin),
        fullDescription: getMultilangTextCopy(variantClone.fullDescription),
        slug: '',
        metaTags: {
          title: getMultilangTextCopy(variantClone.metaTags.title),
          description: getMultilangTextCopy(variantClone.metaTags.description),
          keywords: getMultilangTextCopy(variantClone.metaTags.keywords),
        },
        crossSellProducts: variantClone.crossSellProducts,
        relatedProducts: variantClone.relatedProducts,
        medias: variantClone.medias,
        attributes: []
      } as AddOrUpdateProductVariantDto;
    };

    const variants: AddOrUpdateProductVariantDto[] = [];

    this.toUpdateVariants.forEach(toUpdateVariant => {
      const initialVariant = this.initialFormValue.variants[toUpdateVariant.oldVariantIndex];
      const attributes: ProductSelectedAttributeDto[] = Object.keys(toUpdateVariant.newVariant).map(attributeId => ({
        attributeId,
        valueIds: [toUpdateVariant.newVariant[attributeId]]
      }));

      variants.push({
        ...initialVariant,
        attributes
      });
    });

    this.toAddVariants.forEach((toAddVariant, index) => {
      const initialVariantCopy = getVariantCopy(this.toAddVariantsCopyMap[index]);
      const attributes: ProductSelectedAttributeDto[] = Object.keys(toAddVariant).map(attributeId => ({
        attributeId,
        valueIds: [toAddVariant[attributeId]]
      }));

      variants.push({
        ...initialVariantCopy,
        attributes
      });
    });

    const changedFormValue: AddOrUpdateProductDto = {
      ...this.initialFormValue,
      attributes: this.attributesForProduct.map(a => ({
        attributeId: a.id,
        valueIds: a.values.map(attrValue => attrValue.id)
      })),
      variants
    };

    this.generatedEmitter.emit(changedFormValue);
    this.hide();
  }

  private transformResponse(attributeDtos: AttributeDto[]): AttributeDto[] {
    const hasAttributeValue = (attributes: ProductSelectedAttributeDto[], attributeId: string, valueId: string) => {
      return !!attributes.find(attr => attr.attributeId === attributeId && attr.valueIds.includes(valueId));
    }

    return attributeDtos.map(attributeDto => {
      const values: SelectedAttributeValue[] = attributeDto.values.map(valueDto => {
        const isSelected = hasAttributeValue(this.initialFormValue.attributes, attributeDto.id, valueDto.id)
          || this.initialFormValue.variants.find(v => hasAttributeValue(v.attributes, attributeDto.id, valueDto.id));

        return {
          ...valueDto,
          isSelected: !!isSelected
        };
      });

      values.sort(((a, b) => a.label > b.label ? 1 : -1));

      const selectedAttribute = {
        ...attributeDto,
        values
      };

      if (values.some(v => v.isSelected) && !this.selectedAttributes.find(s => s.id === attributeDto.id)) {
        this.selectedAttributes.push(selectedAttribute);
      }

      return selectedAttribute;
    });
  }

  getPreGeneratedAttrLabel(attribute: AttributeDto) {
    return this.attributeService.getValueLabel(attribute.id, attribute.values.map(v => v.id));
  }

  fetchAttributes(gridValue: IGridValue) {
    this.isGridLoading = true;
    this.cdr.detectChanges();

    this.attributeService.fetchAttributes(gridValue)
      .pipe(this.notyService.attachNoty(), finalize(() => this.isGridLoading = false))
      .subscribe(
        response => {
          this.attributes = this.transformResponse(response.data);
          this.itemsTotal = response.itemsTotal;
          this.pagesTotal = response.pagesTotal;
          this.itemsFiltered = response.itemsFiltered;

          this.cdr.markForCheck();
        }
      )
  }

  toggleAttribute(attribute: SelectedAttribute, state?: boolean) {
    const selectedAttributeIdx = this.selectedAttributes.findIndex(selectedAttribute => selectedAttribute.id === attribute.id);

    state = selectedAttributeIdx === -1;

    if (state === true && selectedAttributeIdx === -1) {
      this.selectedAttributes.push(attribute);
    } else if (state === false && selectedAttributeIdx !== -1) {
      this.selectedAttributes.splice(selectedAttributeIdx, 1);
    }
  }

  toggleAttributeNewValue(attribute: SelectedAttribute) {
    attribute.newValueName = !attribute.newValueName ? new MultilingualTextDto() : null;
  }

  isSelected(attribute: SelectedAttribute): boolean {
    return !!this.selectedAttributes.find(selectedAttribute => selectedAttribute.id === attribute.id);
  }

  getFirstToDeleteVariantIndex(): number | null {
    return this.toDeleteVariantIndices.size ? this.toDeleteVariantIndices.values().next().value : null;
  }

  private selectManufacturerAttribute() {
    const manufacturerAttrId = 'manufacturer';
    if (this.selectedAttributes.find(attribute => attribute.id === manufacturerAttrId)) { return; }

    const manufacturerAttr = this.attributes.find(attribute => attribute.id === manufacturerAttrId);
    if (manufacturerAttr) {
      this.selectedAttributes.push(manufacturerAttr as SelectedAttribute);
    }
  }

  addNewAttributeValue(attribute: SelectedAttribute) {
    attribute.newValueName.ru = attribute.newValueName.ru.trim();
    if (!attribute.newValueName.ru) {
      this.notyService.showErrorNoty(`Не заполнено "Рус" поле`);
      return;
    }

    attribute.newValueName.uk = attribute.newValueName.uk.trim();
    if (!attribute.newValueName.uk) {
      this.notyService.showErrorNoty(`Не заполнено "Укр" поле`);
      return;
    }

    const attributeId = attribute.id;
    const attributeValueDto = new AttributeValueDto();
    attributeValueDto.label = attribute.newValueName;

    this.isLoading = true;

    this.attributeService.addAttributeValue(attributeId, attributeValueDto)
      .pipe(this.takeUntilDestroy(), finalize(() => this.isLoading = false))
      .subscribe(response => {
        attribute.newValueName = null;
      });
  }
}

const attributeGridCells: IGridCell[] = [
  {
    isSearchable: false,
    label: '',
    initialWidth: 100,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: ''
  },
  {
    isSearchable: true,
    label: 'ID',
    initialWidth: 250,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<AttributeDto>('id')
  },
  {
    isSearchable: true,
    label: 'Label',
    initialWidth: 500,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: `${getPropertyOf<AttributeDto>('label')}.${getPropertyOf<MultilingualTextDto>(DEFAULT_LANG)}`
  }
];
