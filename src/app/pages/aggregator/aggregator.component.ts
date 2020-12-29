import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AggregatorService } from '../../shared/services/aggregator.service';
import { HeadService } from '../../shared/services/head.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotyService } from '../../noty/noty.service';
import { EPageAction } from '../../shared/enums/category-page-action.enum';
import { finalize, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AggregatorDto } from '../../shared/dtos/aggregator.dto';
import { ProductListItemDto } from '../../shared/dtos/product.dto';
import { NgUnsubscribe } from '../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { Observable, of } from 'rxjs';
import { ResponseDto } from '../../shared/dtos/response.dto';
import { ProductService } from '../../shared/services/product.service';
import { IGridFilter } from '../../grid/grid.interface';
import { DEFAULT_LANG, UPLOADED_HOST } from '../../shared/constants/constants';
import { ISelectedProduct, ProductSelectorComponent } from '../../product-selector/product-selector.component';

@Component({
  selector: 'aggregator',
  templateUrl: './aggregator.component.html',
  styleUrls: ['./aggregator.component.scss']
})
export class AggregatorComponent extends NgUnsubscribe implements OnInit {

  isNewAggregator: boolean;
  aggregator: AggregatorDto;
  form: FormGroup;
  isLoading: boolean = false;
  isProductsLoading: boolean = false;
  products$: Observable<ProductListItemDto[]>;
  lang = DEFAULT_LANG;

  @ViewChild(ProductSelectorComponent) selectorCmp: ProductSelectorComponent;

  get productIdsControl(): AbstractControl {
    const idsProp: keyof AggregatorDto = 'productIds';
    return this.form.get(idsProp);
  }

  constructor(
    private aggregatorsService: AggregatorService,
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private headService: HeadService,
    private router: Router,
    private notyService: NotyService,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.init();
  }

  private init() {
    this.isNewAggregator = this.route.snapshot.data.action === EPageAction.Add;
    if (this.isNewAggregator) {
      this.aggregator = new AggregatorDto();
      this.buildForm();
      this.headService.setTitle(`Новый агрегатор`);
    } else {
      this.fetchAggregatorAndBuildForm();
    }
  }

  save() {
    if (this.form.invalid) {
      this.notyService.showErrorNoty(`Ошибка в форме`);
      this.validateControls(this.form);
      return;
    }

    if (this.isNewAggregator) {
      this.addNewAggregator();
    } else {
      this.updateAggregator();
    }
  }

  delete() {
    if (!confirm(`Вы действительно хотите удалить этот агрегатор?`)) {
      return;
    }

    this.aggregatorsService.deleteAggregator(this.aggregator.id)
      .pipe(this.notyService.attachNoty({ successText: 'Агрегатор успешно удалён' }))
      .subscribe(
        _ => {
          this.goBack();
        },
        error => console.warn(error)
      );
  }

  private buildForm() {
    const controlsConfig: Record<keyof Omit<AggregatorDto, 'id'>, any> = {
      name: [this.aggregator.name],
      clientName: [this.aggregator.clientName, Validators.required],
      isVisibleOnProductPage: [this.aggregator.isVisibleOnProductPage],
      productIds: [this.aggregator.productIds]
    };

    this.form = this.formBuilder.group(controlsConfig);

    this.products$ = this.productIdsControl.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        startWith(this.productIdsControl.value as number[]),
        tap(() => this.isProductsLoading = true),
        switchMap(productIds => productIds.length ? this.fetchProducts(productIds) : of({ data: [] })),
        this.notyService.attachNoty(),
        tap(() => this.isProductsLoading = false, () => this.isProductsLoading = false),
        map(response => response.data)
      );
  }

  private fetchAggregatorAndBuildForm() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isLoading = true;
    this.aggregatorsService.fetchAggregator(parseInt(id))
      .pipe(this.notyService.attachNoty(), finalize(() => this.isLoading = false))
      .subscribe(
        response => {
          this.aggregator = response.data;
          this.buildForm();
          this.headService.setTitle(this.aggregator.name[DEFAULT_LANG]);
        },
        error => console.warn(error)
      );
  }

  private validateControls(form: FormGroup | FormArray) {
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

  private addNewAggregator() {
    const dto = { ...this.aggregator, ...this.form.value };

    this.aggregatorsService.addNewAggregator(dto)
      .pipe(this.notyService.attachNoty({ successText: 'Агрегатор успешно добавлен' }))
      .subscribe(
        response => {
          this.router.navigate(['admin', 'aggregator', 'edit', response.data.id]);
        },
        error => console.warn(error)
      );
  }

  private updateAggregator() {
    const dto = { ...this.aggregator, ...this.form.value };

    this.aggregatorsService.updateAggregator(this.aggregator.id, dto)
      .pipe(this.notyService.attachNoty({ successText: 'Агрегатор успешно обновлён' }))
      .subscribe(
        response => {
          this.aggregator = response.data;
          this.buildForm();
        },
        error => console.warn(error)
      );
  }

  goBack() {
    this.router.navigate(['admin', 'aggregator']);
  }

  openProductSelector() {
    this.selectorCmp.showSelector();
  }

  setItemThumbnail(product: ProductListItemDto) {
    if (!product.mediaUrl) {
      return 'admin/assets/images/no-img.png';
    } else {
      return UPLOADED_HOST + product.mediaUrl;
    }
  }

  private fetchProducts(productIds: number[]): Observable<ResponseDto<ProductListItemDto[]>> {
    const filters: IGridFilter[] = [{ fieldName: 'id', value: productIds.map(id => id.toString()) }];

    return this.productService.fetchProducts({ limit: productIds.length + 1, filters }, false);
  }

  onProductRemove(product: ProductListItemDto) {
    if (!confirm(`Вы точно хотите убрать товар "${product.name[DEFAULT_LANG]}" из этого списка?`)) { return; }

    const productIds: number[] = this.productIdsControl.value;
    const index = productIds.findIndex(id => id === product.id);
    productIds.splice(index, 1)
    this.productIdsControl.setValue(productIds);
  }

  onProductSelect(selectedProduct: ISelectedProduct) {
    const selectedProductId = selectedProduct.product.id;
    const productIds: number[] = this.productIdsControl.value;

    const index = productIds.findIndex(id => id === selectedProductId)
    if (index > -1) { productIds.splice(index, 1); }

    productIds.push(selectedProductId);
    this.productIdsControl.setValue(productIds);
  }
}

