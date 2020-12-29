import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { CategoriesService } from '../categories.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { CategoryDto } from '../../../shared/dtos/category.dto';
import { DEFAULT_LANG } from '../../../shared/constants/constants';

@Component({
  selector: 'canonical-category-select',
  templateUrl: './canonical-category-select.component.html',
  styleUrls: ['./canonical-category-select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CanonicalCategorySelectComponent),
    multi: true
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanonicalCategorySelectComponent extends SelectComponent implements OnInit {

  isLoading: boolean = false;
  private categories: CategoryDto[] = [];

  get activeOptionLabel(): string {
    const category = this.categories.find(category => category.id === this.value);
    return category ? `${category.name[DEFAULT_LANG]} (id ${category.id})` : '';
  }

  constructor(
    private categoriesService: CategoriesService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.fetchCategories();
  }

  onSearch(event: any) {
    const value = event.target.value.trim().toLowerCase();
    if (!value) {
      this.setOptions(this.categories);
      return;
    }

    const filtered = this.categories.filter(category => category.name[DEFAULT_LANG].toLowerCase().startsWith(value));
    this.setOptions(filtered);
  }

  private fetchCategories() {
    this.isLoading = true;
    this.categoriesService.fetchCategories()
      .pipe( takeUntil(this.ngUnsubscribe), finalize(() => this.isLoading = false) )
      .subscribe(response => {
        this.categories = response.data;
        this.setOptions(this.categories);
        this.cdr.markForCheck();
      });
  }

  private setOptions(categories: CategoryDto[]) {
    this.options = categories.map(category => ({ data: category.id, view: `${category.name[DEFAULT_LANG]} (id ${category.id})` }));
  }
}
