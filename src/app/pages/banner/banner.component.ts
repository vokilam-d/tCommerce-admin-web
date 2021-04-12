import { Component, OnInit, ViewChild } from '@angular/core';
import { BannerTypeModalComponent } from './banner-type-modal/banner-type-modal.component';
import { UPLOADED_HOST } from '../../shared/constants/constants';
import { BannerService } from '../../shared/services/banner.service';
import { takeUntil } from 'rxjs/operators';
import { NgUnsubscribe } from '../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { ProductLabelTypeEnum } from '../../shared/enums/product-label-type.enum';
import { CreateBannerItemDto } from '../../shared/dtos/create-banner-item.dto';
import { UpdateBannerDto } from '../../shared/dtos/update-banner.dto';
import { NotyService } from '../../noty/noty.service';
import { BannerItemDto } from '../../shared/dtos/banner-item.dto';


@Component({
  selector: 'banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent extends NgUnsubscribe implements OnInit {

  bannerItems: BannerItemDto[] = [];
  clickedItemId: number;

  uploadedHost = UPLOADED_HOST;
  itemImgSrc = '/admin/assets/images/plus.svg';

  @ViewChild(BannerTypeModalComponent) bannerTypeModalSelectorCmp: BannerTypeModalComponent;


  constructor(
    private bannerService: BannerService,
    private notyService: NotyService
  ) { super(); }

  ngOnInit(): void {
    this.onInit();
  }

  onInit() {
    this.bannerService.fetchBanner()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        response => {
          this.bannerItems = response.data;

          this.bannerItems.forEach(bannerItem => {
            this.setDiscountValue(bannerItem);
          });
      },
        error => console.warn(error)
      );
  }

  createBannerItem(item: CreateBannerItemDto) {
    this.bannerService.createBannerItem(item)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        this.notyService.attachNoty()
      )
      .subscribe(
        response => {
          const bannerItem = response.data;

          this.bannerItems.splice(this.clickedItemId, 1, bannerItem);

          this.bannerItems[this.clickedItemId] = bannerItem;
          this.setDiscountValue(bannerItem);
        }
      );
  }

  private setDiscountValue(item) {
    if (!item.oldPrice) { return; }
    item.discountValue = Math.ceil((item.oldPrice - item.price) / item.oldPrice * 100);
  }

  showBannerTypeModal(id: number) {
    this.clickedItemId = id;
    this.bannerTypeModalSelectorCmp.openModal();
  }

  getBannerItemSrc(id: number): string {
    const bannerItem = this.bannerItems[id];
    const bannerItemUrl = bannerItem?.media?.variantsUrls?.original;
    return `${this.uploadedHost}${bannerItemUrl}`;
  }

  getLabelClass(item: BannerItemDto) {
    switch (item?.label.type) {
      case ProductLabelTypeEnum.New:
        return 'banner__label--new';
      case ProductLabelTypeEnum.Top:
        return 'banner__label--top';
    }
  }

  save() {
    const updatedBanner = this.bannerItems.map(bannerItem => {
      return {
        id: bannerItem.id,
        type: bannerItem.type,
        slug: bannerItem.slug,
        media: bannerItem.media
      };
    });

    const createdBannerItems: UpdateBannerDto = {
      bannerItems: updatedBanner
    };

    this.bannerService.updateBanner(createdBannerItems)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        this.notyService.attachNoty({ successText: 'Баннер успешно изменен' })
      )
      .subscribe(
        response => {
          this.bannerItems = response.data;

          this.bannerItems.forEach(bannerItem => {
            this.setDiscountValue(bannerItem);
          });
        }
      );
  }
}
