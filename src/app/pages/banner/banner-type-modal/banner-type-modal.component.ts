import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ProductSelectorComponent } from '../../../product-selector/product-selector.component';
import { BannerService } from '../../../shared/services/banner.service';
import { PostSelectorComponent } from '../../../post-selector/post-selector.component';
import { EBannerItemType } from '../../../shared/enums/banner-item-type.enum';
import { MediaDto } from '../../../shared/dtos/media.dto';
import { API_HOST } from '../../../shared/constants/constants';
import { FormControl } from '@angular/forms';
import { CreateBannerItemDto } from '../../../shared/dtos/create-banner-item.dto';


@Component({
  selector: 'banner-type-modal',
  templateUrl: './banner-type-modal.component.html',
  styleUrls: ['./banner-type-modal.component.scss']
})
export class BannerTypeModalComponent implements OnInit {

  isModalVisible = false;
  isItemModalVisible = false;
  isCategoryModalVisible = false;

  mediaDto: MediaDto;
  slug = new FormControl('');
  categories = new FormControl([]);

  @Output() bannerItem = new EventEmitter<CreateBannerItemDto>();

  @ViewChild(ProductSelectorComponent) productSelectorCmp: ProductSelectorComponent;
  @ViewChild(PostSelectorComponent) postSelectorCmp: PostSelectorComponent;


  constructor(private bannerService: BannerService) { }

  ngOnInit(): void { }

  openModal() {
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
  }

  showProductSelector() {
    this.closeModal();
    this.productSelectorCmp.showSelector();
  }

  showPostSelector() {
    this.closeModal();
    this.postSelectorCmp.showSelector();
  }

  showItemModal() {
    this.closeModal();
    this.isItemModalVisible = true;
  }

  showCategorySelectorModal() {
    this.isCategoryModalVisible = true;
  }

  closeManualItemModal() {
    this.closeModal();
    this.isItemModalVisible = false;
  }

  closeCategorySelectorModal() {
    this.closeModal();
    this.isCategoryModalVisible = false;
  }

  onProductSelect({ product }) {
    const item: CreateBannerItemDto = {
      id: product.id,
      type: EBannerItemType.product
    };

    this.bannerItem.emit(item);
    this.productSelectorCmp.hideSelector();
  }

  onPostSelect(post) {
    const item: CreateBannerItemDto = {
      id: post.id,
      type: EBannerItemType.post
    };

    this.bannerItem.emit(item);
    this.postSelectorCmp.hideSelector();
  }

  onCategorySelect(category) {
    const item: CreateBannerItemDto = {
      id: category.id,
      type: EBannerItemType.category
    };

    this.bannerItem.emit(item);
    this.closeCategorySelectorModal();
  }

  saveManualItem() {
    const item: CreateBannerItemDto = {
      type: EBannerItemType.manual,
      slug: this.slug.value,
      media: this.mediaDto
    };

    this.bannerItem.emit(item);
    this.closeManualItemModal();
  }

  onMediaRemove() {
    this.mediaDto = null;
  }

  getMediaUploadUrl() {
    return `${API_HOST}/api/v1/admin/banner/media`;
  }

  mediaUploaded(media: MediaDto) {
    this.mediaDto = media;
  }
}
