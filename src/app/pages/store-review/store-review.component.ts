import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotyService } from '../../noty/noty.service';
import { EPageAction } from '../../shared/enums/category-page-action.enum';
import { StoreReviewDto } from '../../shared/dtos/store-review.dto';
import { StoreReviewService } from '../../shared/services/store-review.service';
import { MediaDto } from '../../shared/dtos/media.dto';
import { formatDate } from '@angular/common';
import { API_HOST } from '../../shared/constants/constants';
import { finalize } from 'rxjs/operators';
import { HeadService } from '../../shared/services/head.service';

@Component({
  selector: 'store-review',
  templateUrl: './store-review.component.html',
  styleUrls: ['./store-review.component.scss']
})
export class StoreReviewComponent implements OnInit {

  isNewStoreReview: boolean;
  storeReview: StoreReviewDto;
  reviewForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private storeReviewService: StoreReviewService,
    private formBuilder: FormBuilder,
    private router: Router,
    private headService: HeadService,
    private notyService: NotyService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.init();
  }

  private init() {
    this.isNewStoreReview = this.route.snapshot.data.action === EPageAction.Add;
    if (this.isNewStoreReview) {
      this.storeReview = new StoreReviewDto();
      this.buildForm();
      this.headService.setTitle(`Новый отзыв о магазине`);
    } else {
      this.fetchStoreReview();
    }
  }

  save() {
    if (this.reviewForm.invalid) {
      this.notyService.showErrorNoty(`Ошибка в форме`);
      this.validateControls(this.reviewForm);
      return;
    }

    if (this.isNewStoreReview) {
      this.addNewStoreReview();
    } else {
      this.updateStoreReview();
    }
  }

  delete() {
    if (!confirm(`Вы действительно хотите удалить этот отзыв?`)) {
      return;
    }

    this.storeReviewService.deleteStoreReview(this.storeReview.id)
      .pipe(this.notyService.attachNoty({ successText: 'Отзыв успешно удалён' }))
      .subscribe(
        _ => {
          this.goBack();
        },
        error => console.warn(error)
      );
  }

  private buildForm() {
    this.reviewForm = this.formBuilder.group({
      isEnabled: this.storeReview.isEnabled,
      name: [this.storeReview.name, Validators.required],
      text: [this.storeReview.text, Validators.required],
      email: this.storeReview.email,
      sortOrder: this.storeReview.sortOrder,
      managerComment: this.storeReview.managerComment,
      rating: [this.storeReview.rating],
      createdAt: formatDate(this.storeReview.createdAt, 'yyyy-MM-ddThh:mm:ss', 'en'),
      medias: [this.storeReview.medias]
    });
  }

  private fetchStoreReview() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isLoading = true;
    this.storeReviewService.fetchStoreReview(id)
      .pipe(this.notyService.attachNoty(), finalize(() => this.isLoading = false))
      .subscribe(
        response => {
          this.storeReview = response.data;
          this.buildForm();
          this.headService.setTitle(`Отзыв о магазине от ${this.storeReview.name}`);
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

  private addNewStoreReview() {
    const dto = { ...this.storeReview, ...this.reviewForm.value };

    this.storeReviewService.addNewStoreReview(dto)
      .pipe(this.notyService.attachNoty({ successText: 'Отзыв успешно добавлен' }))
      .subscribe(
        response => {
          this.router.navigate(['admin', 'store-review', 'edit', response.data.id]);
        },
        error => console.warn(error)
      );
  }

  private updateStoreReview() {
    const dto = { ...this.storeReview, ...this.reviewForm.value };

    this.storeReviewService.updateStoreReview(this.storeReview.id, dto)
      .pipe(this.notyService.attachNoty({ successText: 'Отзыв успешно обновлён' }))
      .subscribe(
        response => {
          this.storeReview = response.data;
          this.buildForm();
        },
        error => console.warn(error)
      );
  }

  goBack() {
    this.router.navigate(['admin', 'store-review']);
  }

  onMediaRemove(media: MediaDto) {
    const controlValue = this.reviewForm.get('medias').value as MediaDto[];
    const index = controlValue.findIndex(value => value.variantsUrls.original === media.variantsUrls.original);
    if (index !== -1) {
      controlValue.splice(index, 1);
    }
  }

  getMediaUploadUrl() {
    return `${API_HOST}/api/v1/admin/store-reviews/media`;
  }

  mediaUploaded(media: MediaDto, mediasControl: AbstractControl) {
    mediasControl.value.push(media);
  }
}
