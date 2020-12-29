import { Component, OnInit, ViewChild } from '@angular/core';
import { CategoriesService } from '../categories.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EPageAction } from '../../../shared/enums/category-page-action.enum';
import { AddOrUpdateCategoryDto, CategoryDto } from '../../../shared/dtos/category.dto';
import { NotyService } from '../../../noty/noty.service';
import { CategoryProductItemSorterModalComponent } from '../category-product-item-sorter-modal/category-product-item-sorter-modal.component';
import { HeadService } from '../../../shared/services/head.service';
import { QuillModules } from 'ngx-quill';
import { QuillHelperService } from '../../../shared/services/quill-helper.service';
import { API_HOST, DEFAULT_LANG, TRANSLATIONS_MAP } from '../../../shared/constants/constants';
import { MediaDto } from '../../../shared/dtos/media.dto';
import { IDraggedEvent } from '../../../shared/directives/draggable-item/draggable-item.directive';
import { EReorderPosition } from '../../../shared/enums/reorder-position.enum';
import { ISelectOption } from '../../../shared/components/select/select-option.interface';
import { EProductsSort } from '../../../shared/enums/product-sort.enum';

@Component({
  selector: 'category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {

  category: CategoryDto;
  form: FormGroup;
  sortOptions: ISelectOption[] = [];
  isClone: boolean = false;
  lang = DEFAULT_LANG;

  get isEnabled() { return this.form?.get('isEnabled') as FormControl; }
  get name() { return this.form?.get('name') as FormControl; }
  get canonicalCategoryId() { return this.form?.get('canonicalCategoryId') as FormControl; }
  get description() { return this.form?.get('description') as FormControl; }
  get slug() { return this.form?.get('slug') as FormControl; }
  get createRedirect() { return this.form?.get('createRedirect') as FormControl; }
  get metaTitle() { return this.form?.get('metaTags.title') as FormControl; }
  get metaDescription() { return this.form?.get('metaTags.description') as FormControl; }
  get metaKeywords() { return this.form?.get('metaTags.keywords') as FormControl; }
  get medias() { return this.form?.get('medias') as FormControl; }
  get defaultItemsSort() { return this.form?.get('defaultItemsSort') as FormControl; }
  get isNewCategory(): boolean { return this.route.snapshot.data.action === EPageAction.Add; }

  @ViewChild(CategoryProductItemSorterModalComponent) sorterCmp: CategoryProductItemSorterModalComponent;

  constructor(
    private categoriesService: CategoriesService,
    private formBuilder: FormBuilder,
    private router: Router,
    private headService: HeadService,
    private notyService: NotyService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.buildSortOptions();
    this.route.params.subscribe(_ => {
      this.init();
    });
  }

  init() {
    this.category = null;

    if (this.isNewCategory) {
      this.buildForm(new AddOrUpdateCategoryDto());
      this.headService.setTitle(`Новая категория`);
    } else {
      this.getCategory();
    }
  }

  getCategory() {
    const id = this.route.snapshot.paramMap.get('id');

    this.categoriesService.fetchCategory(id)
      .pipe(this.notyService.attachNoty())
      .subscribe(
        response => {
          this.category = response.data;
          this.buildForm(this.category);
          this.headService.setTitle(this.category.name[DEFAULT_LANG]);
          this.isClone = Boolean(this.category.canonicalCategoryId);
        },
        error => console.warn(error)
      );
  }

  save() {
    if (this.form.invalid) {
      this.notyService.showErrorNoty(`Ошибка в форме`);
      this.validateAllControls();
      return;
    }

    if (this.isNewCategory) {
      this.addNewCategory();
    } else {
      this.updateCategory();
    }
  }

  delete() {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
      return;
    }

    this.categoriesService.deleteCategory(this.category.id)
      .pipe(this.notyService.attachNoty({ successText: 'Категория успешно удалена' }))
      .subscribe(
        _ => {
          this.router.navigate(['admin', 'category']);
          this.categoriesService.categoryUpdated$.next();
        },
        error => console.warn(error)
      );
  }

  private addNewCategory() {
    const parentId = this.route.snapshot.paramMap.get('parentId');

    this.categoriesService.saveCategory(this.form.value, parentId)
      .pipe(this.notyService.attachNoty({ successText: 'Категория успешно создана' }))
      .subscribe(
        response => {
          this.categoriesService.categoryUpdated$.next();
          this.router.navigate(['admin', 'category', 'edit', response.data.id]);
        },
        error => console.warn(error)
      );
  }

  private updateCategory() {
    const dto = {
      ...this.category,
      ...this.form.value
    };

    this.categoriesService.updateCategory(this.category.id, dto)
      .pipe(this.notyService.attachNoty({ successText: 'Категория успешно изменена' }))
      .subscribe(
        response => {
          this.categoriesService.categoryUpdated$.next();
          this.category = response.data;
          this.buildForm(this.category);
          this.headService.setTitle(this.category.name[DEFAULT_LANG]);
        },
        error => console.warn(error)
      );
  }

  private buildForm(category: AddOrUpdateCategoryDto) {
    const controls: Omit<Record<keyof AddOrUpdateCategoryDto, any>, 'parentId'> = {
      isEnabled: category.isEnabled,
      name: [category.name],
      canonicalCategoryId: category.canonicalCategoryId,
      description: category.description,
      slug: category.slug,
      createRedirect: false,
      metaTags: this.formBuilder.group({
        title: category.metaTags.title,
        description: category.metaTags.description,
        keywords: category.metaTags.keywords,
      }),
      medias: [category.medias],
      defaultItemsSort: [category.defaultItemsSort]
    }

    this.form = this.formBuilder.group(controls);
  }

  private validateAllControls() {
    Object.values(this.form.controls).forEach(control => {
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      }
    });
  }

  isControlInvalid(control: FormControl): boolean {
    return !control.valid && control.touched;
  }

  openItemSorter() {
    this.sorterCmp.openModal();
  }

  getMediaUploadUrl(): string {
    return `${API_HOST}/api/v1/admin/categories/media`;
  }

  mediaUploaded(media: MediaDto, mediasControl: AbstractControl) {
    mediasControl.value.push(media);
  }

  onMediaRemove(media: MediaDto, mediasControl: AbstractControl) {
    const controlValue = mediasControl.value as MediaDto[];
    const index = controlValue.findIndex(value => value.variantsUrls.original === media.variantsUrls.original);
    if (index !== -1) {
      controlValue.splice(index, 1);
    }
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

  private buildSortOptions() {
    [EProductsSort.Popularity, EProductsSort.New, EProductsSort.Cheap, EProductsSort.Expensive]
      .forEach(sort => {
        this.sortOptions.push({ data: sort, view: TRANSLATIONS_MAP[sort] });
      });
  }
}
