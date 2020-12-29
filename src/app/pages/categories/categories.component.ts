import { Component, OnInit } from '@angular/core';
import { CategoriesService } from './categories.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryTreeItem } from '../../shared/dtos/category.dto';
import { NotyService } from '../../noty/noty.service';
import { finalize } from 'rxjs/operators';
import { NgUnsubscribe } from '../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { IDraggedEvent } from '../../shared/directives/draggable-item/draggable-item.directive';
import { HeadService } from '../../shared/services/head.service';
import { DEFAULT_LANG } from '../../shared/constants/constants';

@Component({
  selector: 'categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent extends NgUnsubscribe implements OnInit {

  categories: CategoryTreeItem[];
  isLoading: boolean = false;
  lang = DEFAULT_LANG;

  constructor(
    private categoriesService: CategoriesService,
    private router: Router,
    private headService: HeadService,
    private notyService: NotyService,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.fetchCategoriesTree();
    this.categoriesService.categoryUpdated$.subscribe(_ => this.fetchCategoriesTree());
    this.headService.setTitle('Категории');
  }

  fetchCategoriesTree() {
    this.isLoading = true;
    this.categoriesService.fetchCategoriesTree()
      .pipe(this.notyService.attachNoty(), finalize(() => this.isLoading = false))
      .subscribe(
        response => {
          this.categories = response.data;
        },
        error => console.warn(error)
      );
  }

  addRootCategory() {
    this.addCategory(0);
  }

  addSubCategory() {
    const [ childRoute ] = this.route.children;
    const activeCategoryId = childRoute?.snapshot.paramMap.get('id') || 0;
    this.addCategory(activeCategoryId);
  }

  private addCategory(parentId: string | number) {
    this.router.navigate(['add', 'parent', parentId], { relativeTo: this.route });
  }

  onReorder(draggedEvt: IDraggedEvent) {
    this.isLoading = true;
    this.categoriesService.reorderCategory(draggedEvt.item, draggedEvt.targetItem, draggedEvt.position)
      .pipe(this.notyService.attachNoty(), finalize(() => this.isLoading = false))
      .subscribe(
        response => {
          this.categories = response.data;
        },
        error => console.warn(error)
      );
  }
}
