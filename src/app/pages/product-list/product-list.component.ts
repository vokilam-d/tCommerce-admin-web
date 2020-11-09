import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../../shared/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductCategoryDto, ProductListItemDto, ProductVariantListItemDto } from '../../shared/dtos/product.dto';
import { NotyService } from '../../noty/noty.service';
import { saveFileFromUrl } from '../../shared/helpers/save-file.function';
import { IGridCell, IGridValue } from '../../grid/grid.interface';
import { GridComponent } from '../../grid/grid.component';
import { Subscription } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { getPropertyOf } from '../../shared/helpers/get-property-of.function';
import { UPLOADED_HOST } from '../../shared/constants/constants';
import { HeadService } from '../../shared/services/head.service';
import { NgUnsubscribe } from '../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { AttributeService } from '../../shared/services/attribute.service';
import { DeviceService } from '../../shared/services/device-detector/device.service';
import { logMemory } from '../../shared/helpers/log-memory.function';

@Component({
  selector: 'product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent extends NgUnsubscribe implements OnInit, AfterViewInit {

  private fetchAllSub: Subscription;
  products: ProductListItemDto[];

  isOrderedFiltersVisible: boolean = false;
  orderedDates: [string, string] = [undefined, undefined];

  itemsTotal: number = 0;
  itemsFiltered: number;
  pagesTotal: number = 1;
  gridLinkUrl: string = 'edit';
  isGridLoading: boolean = false;
  gridCells: IGridCell[] = [];
  @ViewChild(GridComponent) gridCmp: GridComponent;

  constructor(private productsService: ProductService,
              private attributeService: AttributeService,
              private route: ActivatedRoute,
              private deviceService: DeviceService,
              private cdr: ChangeDetectorRef,
              private headService: HeadService,
              private notyService: NotyService,
              private router: Router) {
    super();
  }

  ngOnInit() {
    this.setGridCells();
    this.headService.setTitle(`Товары`);
    setTimeout(() => {
      console.log('After "ProductListComponent" render');
      logMemory();
    }, 1000);
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
    return product.categories.map(category => category.name).join(', ');
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

  private setGridCells() {
    this.attributeService.attributes$
      .pipe( takeUntil(this.ngUnsubscribe) )
      .subscribe(attributes => {
        const manufacturerAttribute = attributes.find(attribute => attribute.id === 'manufacturer');

        this.gridCells = [
          /* {
            isSearchable: false,
            label: 'ID',
            initialWidth: 35,
            align: 'center',
            isImage: true,
            isSortable: true,
            fieldName: getPropertyOf<ProductListItemDto>('id')
          }, */
          {
            isSearchable: true,
            label: 'Код',
            initialWidth: 43,
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
            fieldName: getPropertyOf<ProductListItemDto>('name')
          },
          {
            isSearchable: true,
            label: 'Категории',
            initialWidth: 200,
            align: 'left',
            isImage: false,
            isSortable: true,
            fieldName: `${getPropertyOf<ProductListItemDto>('categories')}.${getPropertyOf<ProductCategoryDto>('name')}`
          },
          /* {
            isSearchable: true,
            label: 'Код',
            initialWidth: 43,
            align: 'left',
            isImage: false,
            isSortable: true,
            fieldName: `${getPropertyOf<ProductListItemDto>('variants')}.${getPropertyOf<ProductVariantListItemDto>('sku')}`
          }, */
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
            isSearchable: false,
            label: manufacturerAttribute?.label,
            initialWidth: 120,
            align: 'left',
            isImage: false,
            isSortable: false,
            fieldName: manufacturerAttribute?.id,
            filterFields: manufacturerAttribute?.values.map(value => ({ data: value.id, view: value.label }))
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
            isSearchable: false,
            label: 'Статус',
            initialWidth: 45,
            align: 'left',
            isImage: false,
            isSortable: true,
            fieldName: getPropertyOf<ProductListItemDto>('isEnabled')
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
            isSearchable: false,
            label: 'Дата добавления',
            initialWidth: 82,
            align: 'left',
            isImage: false,
            isSortable: true,
            fieldName: getPropertyOf<ProductListItemDto>('createdAt')
          }
        ];
      });
  }
}
