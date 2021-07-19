import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../../shared/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ProductListItemCategoryDto,
  ProductListItemDto,
  ProductVariantListItemDto
} from '../../shared/dtos/product.dto';
import { NotyService } from '../../noty/noty.service';
import { saveFileFromUrl } from '../../shared/helpers/save-file.function';
import { IGridCell, IGridValue } from '../../grid/grid.interface';
import { GridComponent } from '../../grid/grid.component';
import { combineLatest, forkJoin, Subscription } from 'rxjs';
import { finalize, takeUntil, tap } from 'rxjs/operators';
import { getPropertyOf } from '../../shared/helpers/get-property-of.function';
import { DEFAULT_LANG, UPLOADED_HOST } from '../../shared/constants/constants';
import { HeadService } from '../../shared/services/head.service';
import { NgUnsubscribe } from '../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { AttributeService } from '../../shared/services/attribute.service';
import { DeviceService } from '../../shared/services/device-detector/device.service';
import { copyToClipboard } from '../../shared/helpers/copy-to-clipboard.function';
import { DEFAULT_CURRENCY_CODE } from '../../shared/enums/currency.enum';
import { ReadableCurrencyPipe } from '../../shared/pipes/readable-currency.pipe';
import { DatePipe } from '@angular/common';
import { MultilingualTextDto } from '../../shared/dtos/multilingual-text.dto';
import { SupplierService } from '../../shared/services/supplier.service';
import { SupplierDto } from '../../shared/dtos/supplier.dto';

@Component({
  selector: 'product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent extends NgUnsubscribe implements OnInit, AfterViewInit {

  products: ProductListItemDto[];
  suppliers: SupplierDto[] = [];

  defaultCurrency = DEFAULT_CURRENCY_CODE;
  isOrderedFiltersVisible: boolean = false;
  orderedDates: [string, string] = [undefined, undefined];
  lang = DEFAULT_LANG;

  itemsTotal: number = 0;
  itemsFiltered: number;
  pagesTotal: number = 1;
  gridLinkUrl: string = 'edit';
  isGridLoading: boolean = false;
  gridCells: IGridCell[] = [];

  private fetchAllSub: Subscription;

  @ViewChild(GridComponent) gridCmp: GridComponent;

  constructor(
    private productsService: ProductService,
    private attributeService: AttributeService,
    private route: ActivatedRoute,
    private deviceService: DeviceService,
    private cdr: ChangeDetectorRef,
    private headService: HeadService,
    private notyService: NotyService,
    private router: Router,
    private readableCurrencyPipe: ReadableCurrencyPipe,
    private datePipe: DatePipe,
    private supplierService: SupplierService
  ) {
    super();
  }

  ngOnInit() {
    this.setGridCells();
    this.headService.setTitle(`Товары`);
  }

  ngAfterViewInit(): void {
    this.fetchProducts();
  }

  add() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  fetchProducts(gridValue: IGridValue = this.gridCmp.getValue()) {
    if (this.fetchAllSub) { this.fetchAllSub.unsubscribe(); }

    this.isGridLoading = true;
    this.cdr.detectChanges();
    this.fetchAllSub = this.productsService.fetchProducts({ ...gridValue, orderedDates: this.orderedDates }, false)
      .pipe(this.notyService.attachNoty(), finalize(() => this.isGridLoading = false), takeUntil(this.ngUnsubscribe))
      .subscribe(
        response => {
          this.products = response.data;
          this.itemsTotal = response.itemsTotal;
          this.itemsFiltered = response.itemsFiltered;
          this.pagesTotal = response.pagesTotal;
          setTimeout(() => this.cdr.detectChanges(), 200);
        },
        error => console.warn(error)
      );
  }

  downloadShoppingFeed() {
    const url = this.productsService.getGoogleShoppingFeedUrl();
    saveFileFromUrl(url);
  }

  downloadReviewsFeed() {
    const url = this.productsService.getGoogleReviewsFeedUrl();
    saveFileFromUrl(url);
  }

  onGridChange(evt: IGridValue) {
    this.fetchProducts(evt);
  }

  getItemThumbnail(product: ProductListItemDto): string {
    if (!product.mediaUrl) {
      return 'admin/assets/images/no-img.png';
    } else {
      return UPLOADED_HOST + product.mediaUrl;
    }
  }

  getItemCategories(product: ProductListItemDto): string {
    return product.categories.map(category => category.name[DEFAULT_LANG]).join(', ');
  }

  getManufacturerAttr(product: ProductListItemDto): string {
    if (this.deviceService.isPlatformServer()) { return; }

    const manufacturerId = 'manufacturer';
    const manufacturerAttribute = product.attributes.find(attribute => attribute.attributeId === manufacturerId);
    if (!manufacturerAttribute) { return ''; }

    return this.attributeService.getValueLabel(manufacturerId, manufacturerAttribute.valueIds);
  }

  toggleOrderedFilters() {
    this.isOrderedFiltersVisible = !this.isOrderedFiltersVisible;

    if (!this.isOrderedFiltersVisible) {
      this.orderedDates = [undefined, undefined];
      this.fetchProducts();
    }
  }

  onOrderedDateSelect(event: Event, range: 'from' | 'to') {
    const date: string = (event.target as HTMLInputElement).value;

    const rangeIdx = range === 'from' ? 0 : 1;
    this.orderedDates[rangeIdx] = date;

    this.fetchProducts();
  }

  copyProductsToClipboard() {
    const headerStr: string = this.gridCells
      .filter(cell => cell.fieldName !== getPropertyOf<ProductListItemDto>('mediaUrl'))
      .map(cell => cell.label)
      .join('\t');

    const productsStrArray = this.products
      .map(product => {
        const fields: (string | number)[] = [
          product.skus,
          product.name[DEFAULT_LANG],
          this.getItemCategories(product),
          product.vendorCodes,
          product.gtins,
          this.getManufacturerAttr(product),
          `${product.prices} ${this.readableCurrencyPipe.transform(this.defaultCurrency)}`,
          product.quantitiesInStock,
          product.sellableQuantities,
          product.note,
          this.getSupplier(product),
          `${product.isEnabled ? 'On' : 'Off'}`,
          product.salesCount,
          `${product.isIncludedInShoppingFeed ? 'Да' : 'Нет'}`,
          `${this.datePipe.transform(product.createdAt, 'dd.MM.y')} ${this.datePipe.transform(product.createdAt, 'HH:mm:ss')}`,
          `${this.datePipe.transform(product.updatedAt, 'dd.MM.y')} ${this.datePipe.transform(product.updatedAt, 'HH:mm:ss')}`
        ];

        return fields.join('\t');
      });

    const productsStr = [headerStr, ...productsStrArray].join('\n');
    copyToClipboard(productsStr);
    this.notyService.showSuccessNoty(`Скопировано "${productsStrArray.length}" товаров`);
  }

  getSupplier(product: ProductListItemDto): string {
    return this.suppliers.find(supplier => product.supplierId === supplier.id)?.name;
  }

  private setGridCells() {
    combineLatest([
      this.attributeService.attributes$,
      this.supplierService.fetchAllSuppliers({ limit: 10000 }).pipe( tap(response => this.suppliers = response.data) )
    ])
      .pipe(
        this.notyService.attachNoty(),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(([attributes, suppliersResponse]) => {
        const manufacturerAttribute = attributes.find(attribute => attribute.id === 'manufacturer');

        this.gridCells = [
          {
            isSearchable: true,
            label: 'Код',
            initialWidth: 55,
            align: 'left',
            isImage: false,
            isSortable: true,
            fieldName: `${getPropertyOf<ProductListItemDto>('variants')}.${getPropertyOf<ProductVariantListItemDto>('sku')}`
          },
          {
            isSearchable: false,
            label: 'Фото',
            initialWidth: 60,
            align: 'center',
            isImage: true,
            isSortable: false,
            fieldName: getPropertyOf<ProductListItemDto>('mediaUrl')
          },
          {
            isSearchable: true,
            label: 'Название товара',
            initialWidth: 300,
            align: 'left',
            isImage: false,
            isSortable: true,
            fieldName: `${getPropertyOf<ProductListItemDto>('name')}.${getPropertyOf<MultilingualTextDto>(DEFAULT_LANG)}`
          },
          {
            isSearchable: true,
            label: 'Категории',
            initialWidth: 200,
            align: 'left',
            isImage: false,
            isSortable: true,
            fieldName: `${getPropertyOf<ProductListItemDto>('categories')}.${getPropertyOf<ProductListItemCategoryDto>('name')}.${getPropertyOf<MultilingualTextDto>(DEFAULT_LANG)}`
          },
          {
            isSearchable: true,
            label: 'Артикул',
            initialWidth: 70,
            align: 'left',
            isImage: false,
            isSortable: true,
            fieldName: `${getPropertyOf<ProductListItemDto>('variants')}.${getPropertyOf<ProductVariantListItemDto>('vendorCode')}`
          },
          {
            isSearchable: true,
            label: 'GTIN',
            initialWidth: 105,
            align: 'left',
            isImage: false,
            isSortable: true,
            fieldName: `${getPropertyOf<ProductListItemDto>('variants')}.${getPropertyOf<ProductVariantListItemDto>('gtin')}`
          },
          {
            isSearchable: false,
            label: manufacturerAttribute?.label[DEFAULT_LANG],
            initialWidth: 120,
            align: 'left',
            isImage: false,
            isSortable: false,
            fieldName: manufacturerAttribute?.id,
            filterFields: manufacturerAttribute?.values.map(value => ({ value: value.id, view: value.label[DEFAULT_LANG] }))
          },
          {
            isSearchable: true,
            label: 'Цена',
            initialWidth: 70,
            align: 'left',
            isImage: false,
            isSortable: true,
            fieldName: `${getPropertyOf<ProductListItemDto>('variants')}.${getPropertyOf<ProductVariantListItemDto>('priceInDefaultCurrency')}`
          },
          {
            isSearchable: false,
            label: 'Кол-во на складе',
            initialWidth: 65,
            align: 'left',
            isImage: false,
            isSortable: true,
            fieldName: `${getPropertyOf<ProductListItemDto>('variants')}.${getPropertyOf<ProductVariantListItemDto>('qtyInStock')}`
          },
          {
            isSearchable: false,
            label: 'Кол-во доступно',
            initialWidth: 65,
            align: 'left',
            isImage: false,
            isSortable: true,
            fieldName: `${getPropertyOf<ProductListItemDto>('variants')}.${getPropertyOf<ProductVariantListItemDto>('sellableQty')}`
          },
          {
            isSearchable: true,
            label: 'Комментарий о товаре',
            initialWidth: 100,
            align: 'left',
            isImage: false,
            isSortable: true,
            fieldName: getPropertyOf<ProductListItemDto>('note')
          },
          {
            isSearchable: false,
            label: 'Поставщик',
            initialWidth: 110,
            align: 'left',
            isImage: false,
            isSortable: true,
            fieldName: getPropertyOf<ProductListItemDto>('supplierId'),
            filterFields: suppliersResponse.data.map(supplier => ({ value: supplier.id, view: supplier.name }))
          },
          {
            isSearchable: false,
            label: 'Статус',
            initialWidth: 60,
            align: 'left',
            isImage: false,
            isSortable: true,
            fieldName: getPropertyOf<ProductListItemDto>('isEnabled'),
            filterFields: [{ value: true, view: 'On' }, { value: false, view: 'Off' }]
          },
          {
            isSearchable: false,
            label: 'Кол-во продаж',
            initialWidth: 55,
            align: 'left',
            isImage: false,
            isSortable: true,
            fieldName: getPropertyOf<ProductListItemDto>('salesCount')
          },
          {
            label: 'Shopping feed?',
            initialWidth: 70,
            align: 'left',
            fieldName: getPropertyOf<ProductListItemDto>('isIncludedInShoppingFeed'),
            filterFields: [{ value: true, view: 'Да' }, { value: false, view: 'Нет' }]
          },
          {
            isSearchable: false,
            label: 'Дата добавления',
            initialWidth: 82,
            align: 'left',
            isImage: false,
            isSortable: true,
            fieldName: getPropertyOf<ProductListItemDto>('createdAt')
          },
          {
            isSearchable: false,
            label: 'Дата изменения',
            initialWidth: 82,
            align: 'left',
            isImage: false,
            isSortable: true,
            fieldName: getPropertyOf<ProductListItemDto>('updatedAt')
          }
        ];
      });
  }
}
