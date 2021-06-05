import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../shared/services/product.service';
import { EPageAction } from '../../shared/enums/category-page-action.enum';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MediaDto } from '../../shared/dtos/media.dto';
import { AddOrUpdateProductDto, ProductDto } from '../../shared/dtos/product.dto';
import { NotyService } from '../../noty/noty.service';
import { DEFAULT_CURRENCY_CODE, ECurrencyCode } from '../../shared/enums/currency.enum';
import { API_HOST, DEFAULT_LANG } from '../../shared/constants/constants';
import { finalize, takeUntil } from 'rxjs/operators';
import { AddOrUpdateProductVariantDto, ProductVariantDto } from '../../shared/dtos/product-variant.dto';
import { LinkedProductDto } from '../../shared/dtos/linked-product.dto';
import { HeadService } from '../../shared/services/head.service';
import { IDraggedEvent } from '../../shared/directives/draggable-item/draggable-item.directive';
import { EReorderPosition } from '../../shared/enums/reorder-position.enum';
import { OrderListViewerModalComponent } from './order-list-viewer-modal/order-list-viewer-modal.component';
import { transliterate } from '../../shared/helpers/transliterate.function';
import { MetaTagsDto } from '../../shared/dtos/meta-tags.dto';
import { NgUnsubscribe } from '../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { getClientLinkPrefix } from '../../shared/helpers/get-client-link-prefix.function';
import { MultilingualTextDto } from '../../shared/dtos/multilingual-text.dto';
import { Language } from '../../shared/enums/language.enum';
import { ISelectOption } from '../../shared/components/select/select-option.interface';
import { ProductLabelTypeEnum } from '../../shared/enums/product-label-type.enum';
import { CustomValidators } from '../../shared/classes/validators';

type PostAction = 'duplicate' | 'exit' | 'none';

const PRODUCT_LABEL_OPTIONS: ISelectOption[] = [
  { value: ProductLabelTypeEnum.Empty, view: 'Не выбрано' },
  { value: ProductLabelTypeEnum.New, view: 'Новинка' },
  { value: ProductLabelTypeEnum.Top, view: 'Топ продаж' }
];

@Component({
  selector: 'product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent extends NgUnsubscribe implements OnInit {

  isNewProduct: boolean;
  isNewProductBasedOn: boolean;

  product: ProductDto;
  form: FormGroup;
  currencies = ECurrencyCode;
  isLoading: boolean = false;
  lang = DEFAULT_LANG;
  productLabelSelectOptions: ISelectOption[] = PRODUCT_LABEL_OPTIONS;

  get variantsFormArray() { return this.form.get('variants') as FormArray; }
  get isMultiVariant(): boolean { return this.variantsFormArray.controls.length > 1; }

  @ViewChild(OrderListViewerModalComponent) ordersModal: OrderListViewerModalComponent;

  constructor(
    private productsService: ProductService,
    private formBuilder: FormBuilder,
    private router: Router,
    private headService: HeadService,
    private notyService: NotyService,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.init();
  }

  private init() {
    this.isNewProduct = this.route?.snapshot.data.action === EPageAction.Add;
    this.isNewProductBasedOn = this.route?.snapshot.data.action === EPageAction.AddBasedOn;
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.fetchProductAndBuildForm(id);
    } else {
      this.product = new ProductDto();
      this.buildForm();
      this.headService.setTitle(`Новый товар`);
    }
  }

  save(postAction: PostAction = 'none') {
    if (this.form.invalid) {
      this.notyService.showErrorNoty(`Ошибка в форме`);
      this.validateControls();
      return;
    }

    if (this.isNewProduct || this.isNewProductBasedOn) {
      this.addNewProduct(postAction);
    } else {
      this.updateProduct(postAction);
    }
  }

  delete() {
    if (!confirm(`Вы действительно хотите удалить этот товар?`)) { return; }

    this.isLoading = true;
    this.productsService.deleteProduct(this.product.id)
      .pipe(this.notyService.attachNoty({ successText: 'Товар успешно удалён' }), finalize(() => this.isLoading = false))
      .subscribe(
        _ => {
          this.goBack();
        },
        error => console.warn(error)
      );
  }

  private buildForm() {
    const variantsFormArray = this.formBuilder.array([]);

    this.product.variants.forEach(variant => {
      const variantControls: Record<keyof AddOrUpdateProductVariantDto, any> = {
        name: [variant.name],
        slug: [variant.slug, CustomValidators.slug],
        createRedirect: false,
        attributes: [variant.attributes],
        isEnabled: variant.isEnabled,
        price: [variant.price, Validators.required],
        oldPrice: [variant.oldPrice],
        currency: [variant.currency],
        purchasePrice: [variant.purchasePrice, Validators.required],
        purchaseCurrency: [variant.purchaseCurrency],
        vendorCode: [variant.vendorCode],
        gtin: [variant.gtin],
        label: [variant.label],
        isIncludedInShoppingFeed: [variant.isIncludedInShoppingFeed],
        googleAdsProductTitle: [variant.googleAdsProductTitle],
        medias: [variant.medias],
        fullDescription: [variant.fullDescription],
        shortDescription: [variant.shortDescription],
        metaTags: this.formBuilder.group({
          title: variant.metaTags.title,
          description: variant.metaTags.description,
          keywords: variant.metaTags.keywords
        }),
        qtyInStock: [variant.qtyInStock, Validators.required],
        isDiscountApplicable: variant.isDiscountApplicable,
        relatedProducts: [variant.relatedProducts],
        crossSellProducts: [variant.crossSellProducts]
      };
      const variantFormGroup = this.formBuilder.group(variantControls);
      this.setAltTextOnNameChange(variantFormGroup);
      variantsFormArray.push(variantFormGroup);
    });

    const productControls: Record<keyof Pick<AddOrUpdateProductDto, 'isEnabled' | 'name' | 'categories' | 'additionalServiceIds' | 'attributes' | 'variants' | 'note'>, any> = {
      isEnabled: this.product.isEnabled,
      name: [this.product.name, Validators.required],
      categories: [this.product.categories],
      additionalServiceIds: [this.product.additionalServiceIds || []],
      attributes: [this.product.attributes],
      variants: variantsFormArray,
      note: [this.product.note],
    };

    this.form = this.formBuilder.group(productControls);
  }

  private fetchProductAndBuildForm(id: string) {
    this.isLoading = true;
    this.productsService.fetchProduct(id)
      .pipe(this.notyService.attachNoty(), finalize(() => this.isLoading = false))
      .subscribe(
        response => {
          this.setProduct(response.data as ProductDto)
          this.buildForm();
          this.headService.setTitle(this.product.name[DEFAULT_LANG]);
        },
        error => console.warn(error)
      );
  }

  private validateControls(form: FormGroup | FormArray = this.form) {
    Object.values(form.controls).forEach(control => {
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        this.validateControls(control);
      }
    });
  }

  isControlInvalid(control: AbstractControl) {
    return !control.valid && control.touched;
  }

  private addNewProduct(postAction: PostAction) {
    const dto = this.mergeProducts(this.product, this.form.value);

    let successText: string = 'Товар успешно добавлен';
    if (postAction === 'duplicate') {
      successText = successText + '. Вы перенаправлены на страницу создания нового товара';
    }

    this.isLoading = true;
    this.productsService.addNewProduct(dto)
      .pipe(this.notyService.attachNoty({ successText }), finalize(() => this.isLoading = false))
      .subscribe(
        response => {
          let successUrlCommands: any[] = [];
          switch (postAction) {
            case 'duplicate':
              successUrlCommands = ['add', response.data.id];
              break;
            case 'none':
              successUrlCommands = ['edit', response.data.id];
              break;
          }

          this.router.navigate(['admin', 'product', ...successUrlCommands]);
        },
        error => console.warn(error)
      );
  }

  private updateProduct(postAction: PostAction) {
    const dto = this.mergeProducts(this.product, this.form.value)

    this.isLoading = true;
    this.productsService.updateProduct(this.product.id, dto)
      .pipe(this.notyService.attachNoty({ successText: 'Товар успешно обновлён' }), finalize(() => this.isLoading = false))
      .subscribe(
        response => {
          switch (postAction) {
            case 'duplicate':
              this.router.navigate(['admin', 'product', 'add', response.data.id]);
              break;
            case 'exit':
              this.router.navigate(['admin', 'product']);
              break;
            case 'none':
              this.product = response.data;
              this.buildForm();
              break;
          }
        },
        error => console.warn(error)
      );
  }

  getMediaUploadUrl() {
    return `${API_HOST}/api/v1/admin/products/media`;
  }

  mediaUploaded(media: MediaDto, mediasControl: AbstractControl, index: number) {
    const variantForm = this.variantsFormArray.controls[index];
    const nameControl = variantForm.get('name');

    media.altText = nameControl.value;
    mediasControl.value.push(media);
  }

  onMediaRemove(media: MediaDto, mediasControl: AbstractControl) {
    const controlValue = mediasControl.value as MediaDto[];
    const index = controlValue.findIndex(value => value.variantsUrls.original === media.variantsUrls.original);
    if (index !== -1) {
      controlValue.splice(index, 1);
    }
  }

  onAttributesEdit(generatedFormValue: AddOrUpdateProductDto) {
    this.product = this.mergeProducts(this.product, generatedFormValue);
    this.buildForm();
  }

  goBack() {
    this.router.navigate(['admin', 'product']);
  }

  isDefaultCurrency(variantIdx: number): boolean {
    return this.product.variants[variantIdx].currency === DEFAULT_CURRENCY_CODE;
  }

  onChangeRelatedProducts(products: LinkedProductDto[], index: number) {
    this.product.variants[index].relatedProducts = products;
  }

  onChangeCrossSellProducts(products: LinkedProductDto[], index: number) {
    this.product.variants[index].crossSellProducts = products;
  }

  mergeProducts(product1: ProductDto, product2: AddOrUpdateProductDto): ProductDto {
    const variants = [];
    product2.variants.forEach((product2Variant, index) => {
      let resultVariant = { ...product2Variant };
      const product1Variant = product1.variants[index] || new ProductVariantDto();

      resultVariant = { ...product1Variant, ...resultVariant };

      variants.push(resultVariant);
    });

    return {
      ...product1,
      ...product2,
      variants
    };
  }

  onMediaReorder(mediasControl: AbstractControl, event: IDraggedEvent) {
    const medias: MediaDto[] = mediasControl.value;
    const itemIdx = medias.indexOf(event.item);
    const [itemToMove] = medias.splice(itemIdx, 1);
    const targetIdx = medias.indexOf(event.targetItem);

    let indexWhereToInsert: number;
    if (event.position === EReorderPosition.Start) {
      indexWhereToInsert = targetIdx;
    } else {
      indexWhereToInsert = targetIdx + 1;
    }

    medias.splice(indexWhereToInsert, 0, itemToMove);

    mediasControl.setValue(medias);
  }

  showReservedOrders(variantIdx: number) {
    const variant = this.product.variants[variantIdx];

    this.productsService.fetchOrderIdsForReservedVariant(this.product.id, variant.id)
      .pipe(this.notyService.attachNoty())
      .subscribe(
        response => {
          this.ordersModal.openModal(variant.sku, response.data);
        }
      );
  }

  onNameControlBlur(nameControl: AbstractControl) {
    const name: MultilingualTextDto = nameControl.value;
    if (!name || this.isMultiVariant) { return; }

    const variantsProp: keyof ProductDto = 'variants';
    const variantNameProp: keyof ProductVariantDto = 'name';

    const variantNameControl = (this.form.get(variantsProp) as FormArray).at(0).get(variantNameProp);
    variantNameControl.setValue(name);
    this.onVariantNameControlBlur(variantNameControl, 0);
  }

  onVariantNameControlBlur(nameControl: AbstractControl, variantIndex: number) {
    const nameValue: MultilingualTextDto = nameControl.value;
    if (!nameValue) { return; }

    const variantForm = this.variantsFormArray.controls[variantIndex];

    const slugProp: keyof ProductVariantDto = 'slug';
    const slugControl = variantForm.get(slugProp);
    if (!slugControl.value) {
      slugControl.setValue(transliterate(nameValue[DEFAULT_LANG]));
    }

    const metaProp: keyof ProductVariantDto = 'metaTags';
    const titleProp: keyof MetaTagsDto = 'title';
    const titleControl = variantForm.get(`${metaProp}.${titleProp}`);
    if (titleControl.value) { return; }

    const title: MultilingualTextDto = new MultilingualTextDto();

    Object.entries(nameValue).forEach(([lang, nameText]) => {
      let prefix: string = '';
      switch (lang) {
        case Language.UK:
          prefix = `Купити `;
          break;
        case Language.RU:
          prefix = `Купить `;
          break;
        case Language.EN:
          prefix = `Buy `;
          break;
      }
      title[lang] = `${prefix}${nameText[0].toLowerCase()}${nameText.slice(1)}`;
    });

    titleControl.setValue(title);
  }

  onDescriptionControlBlur(descControl: AbstractControl, variantIndex: number) {
    const description: string = descControl.value[DEFAULT_LANG];
    if (!description) { return; }

    const variantForm = this.variantsFormArray.controls[variantIndex];
    const metaProp: keyof ProductVariantDto = 'metaTags';
    const descriptionProp: keyof MetaTagsDto = 'description';
    const metaDescriptionControl = variantForm.get(`${metaProp}.${descriptionProp}`);
    if (!metaDescriptionControl.value) {
      metaDescriptionControl.setValue(description);
    }
  }

  getClientProductLink(): string {
    return getClientLinkPrefix() + this.product.variants[0].slug;
  }

  private setProduct(productDto: ProductDto) {
    if (!this.isNewProductBasedOn) {
      this.product = productDto;
      return;
    }

    const variantToCopy = (variant: ProductVariantDto): ProductVariantDto => {
      const newVariant = new ProductVariantDto();
      newVariant.relatedProducts = variant.relatedProducts;
      newVariant.crossSellProducts = variant.crossSellProducts;
      newVariant.qtyInStock = variant.qtyInStock;
      newVariant.attributes = variant.attributes;
      newVariant.price = variant.price;
      newVariant.oldPrice = variant.oldPrice;
      newVariant.currency = variant.currency;
      newVariant.purchasePrice = variant.purchasePrice;
      newVariant.purchaseCurrency = variant.purchaseCurrency;
      newVariant.fullDescription = variant.fullDescription;
      newVariant.googleAdsProductTitle = variant.googleAdsProductTitle;
      newVariant.isDiscountApplicable = variant.isDiscountApplicable;
      newVariant.isIncludedInShoppingFeed = variant.isIncludedInShoppingFeed;
      // newVariant.medias = variant.medias;
      newVariant.metaTags = variant.metaTags;
      newVariant.isEnabled = variant.isEnabled;
      newVariant.name = variant.name;
      newVariant.label = variant.label;
      newVariant.shortDescription = variant.shortDescription;
      newVariant.vendorCode = variant.vendorCode;
      return newVariant;
    };

    this.product = new ProductDto();
    this.product.isEnabled = productDto.isEnabled;
    this.product.name = productDto.name;
    this.product.breadcrumbsVariants = productDto.breadcrumbsVariants;
    this.product.categories = productDto.categories;
    this.product.attributes = productDto.attributes;
    this.product.additionalServiceIds = productDto.additionalServiceIds;
    this.product.variants = productDto.variants.map(variantToCopy);
    this.product.note = productDto.note;
  }

  private setAltTextOnNameChange(form: FormGroup) {
    const nameControl = form.controls.name;
    const mediasControl = form.controls.medias;

    nameControl.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(name => {
        mediasControl.value.forEach(media => {
          media.altText = name;
        });
      });
  }
}
