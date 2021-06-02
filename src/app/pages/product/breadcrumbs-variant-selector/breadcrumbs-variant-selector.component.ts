import { Component, Input, OnInit } from '@angular/core';
import { BreadcrumbsVariantDto } from '../../../shared/dtos/breadcrumbs-variant.dto';
import { ISelectOption } from '../../../shared/components/select/select-option.interface';
import { CategoriesService } from '../../categories/categories.service';
import { DEFAULT_LANG } from '../../../shared/constants/constants';

@Component({
  selector: 'breadcrumbs-variant-selector',
  templateUrl: './breadcrumbs-variant-selector.component.html',
  styleUrls: ['./breadcrumbs-variant-selector.component.scss']
})
export class BreadcrumbsVariantSelectorComponent implements OnInit {

  selectOptions: ISelectOption[] = [];
  selectInitialValue: number = null;

  @Input() breadcrumbsVariants: BreadcrumbsVariantDto[] = [];

  constructor(
    private categoriesService: CategoriesService
  ) { }

  ngOnInit(): void {
    this.selectInitialValue = this.breadcrumbsVariants.findIndex(breadcrumbsVariant => breadcrumbsVariant.isActive);
    this.buildSelectOptions();
  }

  private buildSelectOptions() {
    this.categoriesService.fetchCategories()
      .subscribe(response => {
        const categories = response.data;

        this.selectOptions = this.breadcrumbsVariants.map((breadcrumbsVariant, index) => {
          const label = breadcrumbsVariant.categoryIds
            .map(categoryId => {
              const category = categories.find(category => category.id === categoryId)
              return category.name[DEFAULT_LANG];
            })
            .join(' > ');

          return {
            value: index,
            view: label
          };
        });
      });
  }

  onSelect(selectedIndex: number) {
    this.breadcrumbsVariants.forEach((breadcrumbsVariant, index) => {
      breadcrumbsVariant.isActive = selectedIndex === index;
    });
  }
}
