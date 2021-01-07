import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NotyService } from 'src/app/noty/noty.service';
import { DEFAULT_LANG } from 'src/app/shared/constants/constants';
import { ProductService } from 'src/app/shared/services/product.service';
import { ɵstringify } from '@angular/core';
import { BreadcrumbDto } from '../../../shared/dtos/breadcrumb.dto';
import { ProductDto } from '../../../shared/dtos/product.dto';

@Component({
  selector: 'set-breadcrumbs',
  templateUrl: './set-breadcrumbs.component.html',
  styleUrls: ['./set-breadcrumbs.component.scss'],
  providers: [ ProductService ]
})
export class SetBreadcrumbsComponent implements OnInit {
  
  @Output() onChange = new EventEmitter();
  @Input() product: ProductDto;
  breadcrumbsVariants: BreadcrumbDto[][];
  activeBreadcrumb: BreadcrumbDto[];
  isVisible: boolean;
  isDisabled: boolean;
  hasEmpty: boolean;
  isMultiSelect: boolean;
  lang = DEFAULT_LANG;

  constructor(private productService: ProductService,
              private notyService: NotyService
  ) {}

  ngOnInit(): void {
    this.fetchBreadcrumbsVariants(ɵstringify(this.product.id));
    this.activeBreadcrumb = this.product.breadcrumbs;
  }
 
  toggleVisibility(isVisible: boolean = !this.isVisible) {
    if (this.isDisabled) {
      return;
    }
    this.isVisible = isVisible;
  }

  selectOption(breadcrumb) {
    this.activeBreadcrumb = breadcrumb;
    this.product.breadcrumbs = breadcrumb;
    this.isVisible = false;
    this.fetchBreadcrumbsVariants(ɵstringify(this.product.id));
  }

  async fetchBreadcrumbsVariants (id: string) {
    await this.productService.fetchProductBreadcrumbs(id)
    .pipe(this.notyService.attachNoty())
    .subscribe(
      response => {
        this.breadcrumbsVariants = response;
      },
      error => console.warn(error)
    );
  }

}
