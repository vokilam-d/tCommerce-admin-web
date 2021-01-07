import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NotyService } from 'src/app/noty/noty.service';
import { DEFAULT_LANG } from 'src/app/shared/constants/constants';
import { ProductService } from 'src/app/shared/services/product.service';
import { ɵstringify } from '@angular/core';
import { BreadcrumbDto } from './../../../shared/dtos/breadcrumb.dto';
import { ProductDto } from './../../../shared/dtos/product.dto';

@Component({
  selector: 'set-breadcrumps',
  templateUrl: './set-breadcrumps.component.html',
  styleUrls: ['./set-breadcrumps.component.scss'],
  providers: [ ProductService ]
})
export class SetBreadcrumpsComponent implements OnInit {
  
  @Output() onChange = new EventEmitter();
  @Input() product: ProductDto;
  breadcrumpsVariants: BreadcrumbDto[][];
  activeBreadcrump: BreadcrumbDto[];
  isVisible: boolean;
  isDisabled: boolean;
  hasEmpty: boolean;
  isMultiSelect: boolean;
  lang = DEFAULT_LANG;

  constructor(private productService: ProductService,
              private notyService: NotyService
  ) {}

  ngOnInit(): void {
    this.fetchBreadcrumpsVariants(ɵstringify(this.product.id));
    this.activeBreadcrump = this.product.breadcrumbs;
  }
 
  toggleVisibility(isVisible: boolean = !this.isVisible) {
    if (this.isDisabled) {
      return;
    }
    this.isVisible = isVisible;
  }

  selectOption(breadcrump) {
    this.activeBreadcrump = breadcrump;
    this.product.breadcrumbs = breadcrump;
    this.isVisible = false;
    this.fetchBreadcrumpsVariants(ɵstringify(this.product.id));
  }

  async fetchBreadcrumpsVariants (id: string) {
    await this.productService.fetchProductBreadcrumps(id)
    .pipe(this.notyService.attachNoty())
    .subscribe(
      response => {
        this.breadcrumpsVariants = response;
      },
      error => console.warn(error)
    );
  }

}
