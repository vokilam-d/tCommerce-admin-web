import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { BlogPostDto } from '../../shared/dtos/blog-post.dto';
import { getPropertyOf } from '../../shared/helpers/get-property-of.function';
import { IGridCell, IGridValue } from '../../grid/grid.interface';
import { GridComponent } from '../../grid/grid.component';
import { HeadService } from '../../shared/services/head.service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { NgUnsubscribe } from '../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { Subscription } from 'rxjs';
import { BlogPostService } from '../../shared/services/blog-post.service';
import { NotyService } from '../../noty/noty.service';
import { DEFAULT_LANG } from '../../shared/constants/constants';
import { MultilingualTextDto } from '../../shared/dtos/multilingual-text.dto';

@Component({
  selector: 'blog-post-list',
  templateUrl: './blog-post-list.component.html',
  styleUrls: ['./blog-post-list.component.scss']
})
export class BlogPostListComponent extends NgUnsubscribe implements OnInit, AfterViewInit {

  posts: BlogPostDto[] = [];
  postsTotal: number = 0;
  pagesTotal: number = 1;
  itemsFiltered: number;
  isGridLoading: boolean = false;
  gridLinkFieldName: string = getPropertyOf<BlogPostDto>('id');
  gridCells: IGridCell[] = postGridCells;
  lang = DEFAULT_LANG;

  private fetchAllSub: Subscription;

  @ViewChild(GridComponent) gridCmp: GridComponent;

  constructor(
    private headService: HeadService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private blogPostService: BlogPostService,
    private notyService: NotyService
  ) {
    super();
  }

  ngOnInit(): void {
    this.headService.setTitle(`Блог Посты`);
  }

  ngAfterViewInit() {
    const gridValue = this.gridCmp.getValue();
    this.fetchPosts(gridValue);
  }

  fetchPosts(gridValue: IGridValue) {
    if (this.fetchAllSub) { this.fetchAllSub.unsubscribe(); }

    this.isGridLoading = true;
    this.cdr.detectChanges();
    this.fetchAllSub = this.blogPostService.fetchAllPosts(gridValue)
      .pipe(this.notyService.attachNoty(), finalize(() => this.isGridLoading = false))
      .subscribe(
        response => {
          this.posts = response.data;
          this.postsTotal = response.itemsTotal;
          this.pagesTotal = response.pagesTotal;
          this.itemsFiltered = response.itemsFiltered;
        }
      );
  }

  add() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }
}

const postGridCells: IGridCell[] = [
  {
    isSearchable: true,
    label: 'ID',
    initialWidth: 40,
    align: 'center',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<BlogPostDto>('id')
  },
  {
    isSearchable: true,
    label: 'Название',
    initialWidth: 500,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: `${getPropertyOf<BlogPostDto>('name')}.${getPropertyOf<MultilingualTextDto>(DEFAULT_LANG)}`
  },
  {
    isSearchable: false,
    hasDateFromFilter: true,
    hasDateToFilter: true,
    label: 'Создан',
    initialWidth: 130,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<BlogPostDto>('createdAt')
  },
  {
    isSearchable: false,
    hasDateFromFilter: true,
    hasDateToFilter: true,
    label: 'Опубликован',
    initialWidth: 130,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<BlogPostDto>('publishedAt')
  }
];
