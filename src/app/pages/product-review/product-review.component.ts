import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotyService } from '../../noty/noty.service';
import { EPageAction } from '../../shared/enums/category-page-action.enum';
import { ProductReviewDto } from '../../shared/dtos/product-review.dto';
import { ProductReviewService } from '../../shared/services/product-review.service';
import { MediaDto } from '../../shared/dtos/media.dto';
import { formatDate } from '@angular/common';
import { ProductSelectorComponent } from '../../product-selector/product-selector.component';
import { API_HOST } from '../../shared/constants/constants';
import { finalize } from 'rxjs/operators';
import { HeadService } from '../../shared/services/head.service';

@Component({
  selector: 'product-review',
  templateUrl: './product-review.component.html',
  styleUrls: ['./product-review.component.scss']
})
export class ProductReviewComponent implements OnInit {

  isNewProductReview: boolean;
  productReview: ProductReviewDto;
  reviewForm: FormGroup;
  isLoading: boolean = false;
  get commentsFormArray() { return this.reviewForm.get('comments') as FormArray; }

  @ViewChild(ProductSelectorComponent) productSelectorCmp: ProductSelectorComponent;

  constructor(
    private productReviewService: ProductReviewService,
    private formBuilder: FormBuilder,
    private headService: HeadService,
    private router: Router,
    private notyService: NotyService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.init();
  }

  private init() {
    this.isNewProductReview = this.route.snapshot.data.action === EPageAction.Add;
    if (this.isNewProductReview) {
      this.productReview = new ProductReviewDto();
      this.buildForm();
      this.headService.setTitle(`Новый отзыв о товаре`);
    } else {
      this.fetchProductReview();
    }
  }

  save() {
    if (this.reviewForm.invalid) {
      this.notyService.showErrorNoty(`Ошибка в форме`);
      this.validateControls(this.reviewForm);
      return;
    }

    if (this.isNewProductReview) {
      this.addNewProductReview();
    } else {
      this.updateProductReview();
    }
  }

  delete() {
    if (!confirm(`Вы действительно хотите удалить этот отзыв?`)) {
      return;
    }

    this.productReviewService.deleteProductReview(this.productReview.id)
      .pipe(this.notyService.attachNoty({ successText: 'Отзыв успешно удалён' }))
      .subscribe(
        _ => {
          this.goBack();
        },
        error => console.warn(error)
      );
  }

  private buildForm() {
    const commentsFormArray = this.formBuilder.array([]);

    this.productReview.comments.forEach(comment => {
      const group = this.formBuilder.group({
        isEnabled: comment.isEnabled,
        name: [comment.name, Validators.required],
        text: [comment.text, Validators.required],
        email: comment.email,
        createdAt: formatDate(comment.createdAt, 'yyyy-MM-ddThh:mm:ss', 'en')
      });

      commentsFormArray.push(group);
    });

    this.reviewForm = this.formBuilder.group({
      isEnabled: this.productReview.isEnabled,
      name: [this.productReview.name, Validators.required],
      text: [this.productReview.text, Validators.required],
      email: this.productReview.email,
      sortOrder: this.productReview.sortOrder,
      managerComment: this.productReview.managerComment,
      medias: [this.productReview.medias],
      rating: [this.productReview.rating],
      createdAt: formatDate(this.productReview.createdAt, 'yyyy-MM-ddThh:mm:ss', 'en'),
      comments: commentsFormArray
    });
  }

  private fetchProductReview() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isLoading = true;
    this.productReviewService.fetchProductReview(parseInt(id))
      .pipe(this.notyService.attachNoty(), finalize(() => this.isLoading = false))
      .subscribe(
        response => {
          this.productReview = response.data;
          this.buildForm();
          this.headService.setTitle(`Отзыв о товаре от ${this.productReview.name}`);
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

  private addNewProductReview() {
    const dto = { ...this.productReview, ...this.reviewForm.value };

    this.productReviewService.addNewProductReview(dto)
      .pipe(this.notyService.attachNoty({ successText: 'Отзыв успешно добавлен' }))
      .subscribe(
        response => {
          this.router.navigate(['admin', 'product-review', 'edit', response.data.id]);
        },
        error => console.warn(error)
      );
  }

  private updateProductReview() {
    const dto = { ...this.productReview, ...this.reviewForm.value };

    this.productReviewService.updateProductReview(this.productReview.id, dto)
      .pipe(this.notyService.attachNoty({ successText: 'Отзыв успешно обновлён' }))
      .subscribe(
        response => {
          this.productReview = response.data;
          this.buildForm();
        },
        error => console.warn(error)
      );
  }

  goBack() {
    this.router.navigate(['admin', 'product-review']);
  }

  onMediaRemove(media: MediaDto) {
    const controlValue = this.reviewForm.get('medias').value as MediaDto[];
    const index = controlValue.findIndex(value => value.variantsUrls.original === media.variantsUrls.original);
    if (index !== -1) {
      controlValue.splice(index, 1);
    }
  }

  getMediaUploadUrl() {
    return `${API_HOST}/api/v1/admin/product-reviews/media`;
  }

  mediaUploaded(media: MediaDto, mediasControl: AbstractControl) {
    mediasControl.value.push(media);
  }

  openProductSelector() {
    this.productSelectorCmp.showSelector();
  }

  onProductSelected({ product, variant }) {
    this.productReview.productId = product.id;
    this.productReview.productName = product.name;
    this.productReview.productVariantId = variant.id;
    this.productSelectorCmp.hideSelector();
  }

  removeComment(commentIdx: number) {
    this.commentsFormArray.removeAt(commentIdx);
  }
}
