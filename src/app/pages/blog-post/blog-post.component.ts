import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogPostDto, LinkedBlogCategoryDto, LinkedBlogPostDto } from '../../shared/dtos/blog-post.dto';
import { NotyService } from '../../noty/noty.service';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { BlogPostService } from '../../shared/services/blog-post.service';
import { NgUnsubscribe } from '../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { EPageAction } from '../../shared/enums/category-page-action.enum';
import { HeadService } from '../../shared/services/head.service';
import { API_HOST, DEFAULT_LANG } from '../../shared/constants/constants';
import { QuillModules } from 'ngx-quill';
import { QuillHelperService } from '../../shared/services/quill-helper.service';
import { formatDate } from '@angular/common';
import { MediaDto } from '../../shared/dtos/media.dto';
import { IDraggedEvent } from '../../shared/directives/draggable-item/draggable-item.directive';
import { EReorderPosition } from '../../shared/enums/reorder-position.enum';
import { LinkedProductDto } from '../../shared/dtos/linked-product.dto';
import { ISelectOption } from '../../shared/components/select/select-option.interface';
import { BlogCategoryService } from '../../shared/services/blog-category.service';
import { BlogCategoryDto } from '../../shared/dtos/blog-category.dto';

@Component({
  selector: 'blog-post',
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.scss']
})
export class BlogPostComponent extends NgUnsubscribe implements OnInit {

  isNewBlogPost: boolean;
  post: BlogPostDto;
  form: FormGroup;
  isLoading: boolean = false;
  categoriesOptions: ISelectOption[] = [];
  linkedPosts: LinkedBlogPostDto[];
  lang = DEFAULT_LANG;
  private categories: BlogCategoryDto[] = [];

  constructor(
    private router: Router,
    private notyService: NotyService,
    private formBuilder: FormBuilder,
    private blogPostService: BlogPostService,
    private blogCategoryService: BlogCategoryService,
    private route: ActivatedRoute,
    private headService: HeadService
  ) {
    super();
  }

  ngOnInit(): void {
    this.init();
    this.buildCategoryOptions();
  }

  private init() {
    this.isNewBlogPost = this.route.snapshot.data.action === EPageAction.Add;
    if (this.isNewBlogPost) {
      this.post = new BlogPostDto();
      this.buildForm();
      this.headService.setTitle(`Новый пост`);
    } else {
      this.fetchPostAndBuildForm();
    }
  }

  private fetchPostAndBuildForm() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isLoading = true;
    this.blogPostService.fetchPost(parseInt(id))
      .pipe(this.notyService.attachNoty(), finalize(() => this.isLoading = false))
      .subscribe(
        response => {
          this.post = response.data;
          this.linkedPosts = this.post.linkedPosts;
          this.buildForm();
          this.headService.setTitle(this.post.name[DEFAULT_LANG]);
        },
        error => console.warn(error)
      );
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: [this.post.name],
      slug: [this.post.slug],
      category: [this.post.category?.id],
      content: [this.post.content],
      shortContent: [this.post.shortContent],
      publishedAt: formatDate(this.post.publishedAt, 'yyyy-MM-ddThh:mm:ss', 'en'),
      isEnabled: [this.post.isEnabled],
      linkedPosts: [this.post.linkedPosts],
      linkedProducts: [this.post.linkedProducts],
      medias: [this.post.medias],
      metaTags: this.formBuilder.group({
        title: this.post.metaTags.title,
        description: this.post.metaTags.description,
        keywords: this.post.metaTags.keywords
      }),
      sortOrder: [this.post.sortOrder],
      featuredMedia: [this.post.featuredMedia]
    });
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

  private addNewBlogPost() {
    const categoryDto = this.categories.find(category => category.id === this.form.value.category);
    const linkedCategoryDto: LinkedBlogCategoryDto = {
      slug: categoryDto.slug,
      id: categoryDto.id,
      name: categoryDto.name
    };

    const dto: BlogPostDto = { ...this.post, ...this.form.value, category: linkedCategoryDto };

    this.blogPostService.addNewPost(dto)
      .pipe(this.notyService.attachNoty({ successText: 'Пост успешно добавлен' }))
      .subscribe(
        response => {
          this.router.navigate(['admin', 'blog-post', 'edit', response.data.id]);
        },
        error => console.warn(error)
      );
  }

  private updateBlogPost() {
    const categoryDto = this.categories.find(category => category.id === this.form.value.category);
    const linkedCategoryDto: LinkedBlogCategoryDto = {
      slug: categoryDto.slug,
      id: categoryDto.id,
      name: categoryDto.name
    };

    const dto = { ...this.post, ...this.form.value, category: linkedCategoryDto };

    this.blogPostService.updatePost(this.post.id, dto)
      .pipe(this.notyService.attachNoty({ successText: 'Пост успешно обновлён' }))
      .subscribe(
        response => {
          this.post = response.data;
          this.buildForm();
        },
        error => console.warn(error)
      );
  }

  goBack() {
    this.router.navigate(['admin', 'blog-post']);
  }

  delete() {
    if (!confirm(`Вы действительно хотите удалить этот пост?`)) {
      return;
    }

    this.blogPostService.deletePost(this.post.id)
      .pipe(this.notyService.attachNoty({ successText: 'Пост успешно удалён' }))
      .subscribe(
        _ => {
          this.goBack();
        },
        error => console.warn(error)
      );
  }

  save() {
    if (this.form.invalid) {
      this.notyService.showErrorNoty(`Ошибка в форме`);
      this.validateControls(this.form);
      return;
    }

    if (this.isNewBlogPost) {
      this.addNewBlogPost();
    } else {
      this.updateBlogPost();
    }
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

  mediaUploaded(media: MediaDto, mediasControl: AbstractControl) {
    mediasControl.value.push(media);
  }

  getMediaUploadUrl() {
    return `${API_HOST}/api/v1/admin/blog/posts/media`;
  }

  onFeatureMediaRemove(media: MediaDto, featuredMediasControl: AbstractControl) {
    featuredMediasControl.setValue(null);
  }

  featureMediaUploaded(media: MediaDto, featuredMediasControl: AbstractControl) {
    featuredMediasControl.setValue(media);
  }

  onChangeRelatedProducts(products: LinkedProductDto[]) {
    this.post.linkedProducts = products;
  }

  buildCategoryOptions() {
    const filter = { limit: 100 };

    this.blogCategoryService.fetchAllCategories(filter).subscribe(response => {
      this.categories = response.data;

      this.categoriesOptions = response.data.map(category => {
        return {
          data: category.id,
          view: category.name[DEFAULT_LANG]
        }
      });
    });
  }

  onChangeRelatedPosts(posts: LinkedBlogPostDto[]) {
    this.post.linkedPosts = posts;
  }

}
