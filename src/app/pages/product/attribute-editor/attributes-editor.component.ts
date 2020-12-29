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
}

interface ITruncatedVariant {
  existingVariantIndex?: number;
  variantIndexForSorting?: number;
  needToCopy?: boolean;
  attributes: {
    [attrId: string]: SelectedAttributeValue['id'];
  };
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

  preGeneratedAttrsForProduct: AttributeDto[] = [];
  truncVariants: ITruncatedVariant[] = [];

  stepsEnum = ESelectionStep;
  attrTypeEnum = EAttributeType;

  itemsTotal: number = 0;
  itemsFiltered: number;
  pagesTotal: number = 1;
  isGridLoading: boolean = false;
  gridCells: IGridCell[] = attributeGridCells;

  @Input() initialFormValue: AddOrUpdateProductDto;
  @Input() isSelectManufacturerAttr: boolean = false;
  @Output('generated') generatedEmitter = new EventEmitter<AddOrUpdateProductDto>();

  get variantsToCreate(): ITruncatedVariant[] {
    return this.truncVariants.filter(variant =>
      variant.existingVariantIndex === -1 || variant.needToCopy
    );
  }

  get variantsToRemove(): AddOrUpdateProductVariantDto[] {
    return this.initialFormValue.variants.filter((variant, index) =>
      this.truncVariants.every(truncVariant => truncVariant.existingVariantIndex !== index)
    );
  };

  get variantsToLeave(): AddOrUpdateProductVariantDto[] {
    return this.initialFormValue.variants.filter((variant, index) =>
      this.truncVariants.find(truncVariant => truncVariant.existingVariantIndex === index && !truncVariant.needToCopy)
    );
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
    this.preGeneratedAttrsForProduct = [];
    this.truncVariants = [];
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

      if (!this.truncVariants.length) {
        this.nextStep();
      }
    }
  }

  private preGenerateVariants() {
    this.resetPreGenerated();

    const attributesForVariants: AttributeDto[] = [];
    const selectedAttributesWithSelectedValues: SelectedAttribute[] = this.selectedAttributes.map(attr => {
      return { ...attr, values: attr.values.filter(v => v.isSelected) };
    });

    selectedAttributesWithSelectedValues.forEach(selectedAttr => {
      if (selectedAttr.type === EAttributeType.MultiSelect || selectedAttr.values.length === 1) {
        this.preGeneratedAttrsForProduct.push(selectedAttr);
      } else {
        attributesForVariants.push(selectedAttr);
      }
    });

    this.truncVariants = [];
    const populateTruncVariants = (variant: ITruncatedVariant = { attributes: {} }, attrIdx = 0, valueIdx = 0) => {
      const attr = attributesForVariants[attrIdx];
      if (!attr) { return; }
      const value = attr.values[valueIdx];
      if (!value) { return; }

      variant = JSON.parse(JSON.stringify(variant));
      variant.attributes[attr.id] = value.id;

      if (attributesForVariants[attrIdx + 1]) {
        populateTruncVariants(variant, attrIdx + 1, 0);
      } else {
        this.truncVariants.push(variant);
      }

      if (attr.values[valueIdx + 1]) {
        populateTruncVariants(variant, attrIdx, valueIdx + 1);
      }
    };
    populateTruncVariants();

    const usedExistingIndices = new Set<number>();
    this.truncVariants = this.truncVariants.map(truncVariant => {
      const attributeKeys = Object.keys(truncVariant.attributes);

      const setExistingVariantIndex = (matchEveryAttr: boolean, attrAndValue: boolean) => {
        truncVariant.existingVariantIndex = this.initialFormValue.variants.findIndex(variant => {

          const hasAttrAndValue = (attribute: ProductSelectedAttributeDto) =>
            attributeKeys.find(attrKey =>
              attribute.attributeId === attrKey && attribute.valueIds.includes(truncVariant.attributes[attrKey])
            );

          const hasAttr = (attribute: ProductSelectedAttributeDto) =>
            attributeKeys.find(attrKey =>
              attribute.attributeId === attrKey
            );

          if (matchEveryAttr) {
            if (attrAndValue) {
              return variant.attributes.every(hasAttrAndValue);
            } else {
              return variant.attributes.every(hasAttr) && variant.attributes.some(hasAttrAndValue);
            }
          } else {
            if (attrAndValue) {
              return variant.attributes.some(hasAttrAndValue);
            } else {
              return variant.attributes.some(hasAttr)
            }
          }
        });
      };

      setExistingVariantIndex(true, true);
      const isFullMatch: boolean = truncVariant.existingVariantIndex > -1;

      if (truncVariant.existingVariantIndex === -1) {
        setExistingVariantIndex(true, false);
      }

      if (truncVariant.existingVariantIndex === -1) {
        setExistingVariantIndex(false, true);
      }

      if (truncVariant.existingVariantIndex === -1) {
        setExistingVariantIndex(false, false);
      }


      if (isFullMatch) {
        truncVariant.needToCopy = usedExistingIndices.has(truncVariant.existingVariantIndex);
        truncVariant.variantIndexForSorting = truncVariant.needToCopy ? -1 : truncVariant.existingVariantIndex;
        usedExistingIndices.add(truncVariant.existingVariantIndex);
      } else {
        truncVariant.needToCopy = true;
        truncVariant.variantIndexForSorting = -1;
      }

      return truncVariant;
    });

    this.truncVariants.sort((a, b) => {
      if (a.variantIndexForSorting === b.variantIndexForSorting) {
        return 0;
      }
      if (a.variantIndexForSorting === -1) {
        return 1;
      }
      if (b.variantIndexForSorting === -1) {
        return -1;
      }

      return a.variantIndexForSorting - b.variantIndexForSorting;
    });
  }

  private finish() {
    const getStringCopy = (str: string): string => `КОПИЯ - ${str}`;
    const getMultilangTextCopy = (text: MultilingualTextDto): MultilingualTextDto => {
      const copy = new MultilingualTextDto();
      Object.entries(text).forEach(([lang, value]) => copy[lang] = getStringCopy(value));
      return copy;
    }
    const getVariantCopy = (idx: number) => {
      if (idx === -1) {
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
        googleAdsProductTitle: getStringCopy(variantClone.googleAdsProductTitle),
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

    const variants: AddOrUpdateProductVariantDto[] = this.truncVariants.map(truncVariant => {
      const idx = truncVariant.existingVariantIndex;

      let variant: AddOrUpdateProductVariantDto;
      if (idx === -1 || truncVariant.needToCopy) {
        variant = getVariantCopy(idx);
      } else {
        variant = {
          ...this.initialFormValue.variants[truncVariant.existingVariantIndex],
          attributes: []
        };
      }

      Object.keys(truncVariant.attributes).forEach(attributeId => {
        variant.attributes.push({
          attributeId,
          valueIds: [truncVariant.attributes[attributeId]]
        });
      });

      return variant;
    });

    if (!variants.length) {
      variants.push({
        ...this.initialFormValue.variants[0],
        attributes: []
      });
    }

    const changedFormValue: AddOrUpdateProductDto = {
      ...this.initialFormValue,
      attributes: this.preGeneratedAttrsForProduct.map(a => ({
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

  isSelected(attribute: SelectedAttribute): boolean {
    return !!this.selectedAttributes.find(selectedAttribute => selectedAttribute.id === attribute.id);
  }

  private selectManufacturerAttribute() {
    const manufacturerAttrId = 'manufacturer';
    if (this.selectedAttributes.find(attribute => attribute.id === manufacturerAttrId)) { return; }

    const manufacturerAttr = this.attributes.find(attribute => attribute.id === manufacturerAttrId);
    if (manufacturerAttr) {
      this.selectedAttributes.push(manufacturerAttr as SelectedAttribute);
    }
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
