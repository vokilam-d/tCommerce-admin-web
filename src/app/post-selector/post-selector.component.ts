import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { GridComponent } from '../grid/grid.component';
import { BlogPostService } from '../shared/services/blog-post.service';
import { IGridCell, IGridValue } from '../grid/grid.interface';
import { Subscription } from 'rxjs';
import { BlogPostDto, LinkedBlogCategoryDto } from '../shared/dtos/blog-post.dto';
import { finalize } from 'rxjs/operators';
import { NotyService } from '../noty/noty.service';
import { getPropertyOf } from '../shared/helpers/get-property-of.function';
import { DEFAULT_LANG, UPLOADED_HOST } from '../shared/constants/constants';
import { MultilingualTextDto } from '../shared/dtos/multilingual-text.dto';

@Component({
  selector: 'post-selector',
  templateUrl: './post-selector.component.html',
  styleUrls: ['./post-selector.component.scss']
})
export class PostSelectorComponent implements OnInit {

  posts: BlogPostDto[] = [];
  categories: string[] = [];
  postsTotal: number = 0;
  pagesTotal: number = 1;
  isSelectorVisible: boolean = false;
  isGridLoading: boolean = false
  gridCells: IGridCell[] = POST_GRID_CELLS;
  lang = DEFAULT_LANG;

  private fetchAllSub: Subscription;

  @Output('selected') selectedEmitter: EventEmitter<BlogPostDto> = new EventEmitter();
  @ViewChild(GridComponent) gridCmp: GridComponent;

  constructor(
    private blogPostService: BlogPostService,
    private cdr: ChangeDetectorRef,
    private notyService: NotyService
  ) { }

  ngOnInit(): void { }

  showSelector() {
    this.isSelectorVisible = true;

    setTimeout(() => {
      const gridValue = this.gridCmp.getValue();
      this.fetchPosts(gridValue);
    }, 320);
  }

  hideSelector() {
    this.isSelectorVisible = false;
  }

  fetchPosts(gridValue: IGridValue) {
    if (this.fetchAllSub) { this.fetchAllSub.unsubscribe(); }

    this.isGridLoading = true;
    this.cdr.markForCheck();
    this.fetchAllSub = this.blogPostService.fetchAllPosts(gridValue)
      .pipe(
        this.notyService.attachNoty(),
        finalize(() => {
          this.isGridLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe(
        response => {
          this.posts = response.data;
          this.postsTotal = response.itemsTotal;
          this.pagesTotal = response.pagesTotal;
        }
      );
  }

  selectPost(post: BlogPostDto) {
    this.selectedEmitter.emit(post);
    this.notyService.showSuccessNoty(`Пост добавлен`);
  }

  getItemThumbnail(post: BlogPostDto): string {
    if (!post.featuredMedia) {
      return 'admin/assets/images/no-img.png';
    } else {
      return UPLOADED_HOST + post.featuredMedia.variantsUrls.original;
    }
  }
}

const POST_GRID_CELLS: IGridCell[] = [
  {
    isSearchable: false,
    label: 'ID',
    initialWidth: 35,
    align: 'center',
    isImage: true,
    isSortable: true,
    fieldName: getPropertyOf<BlogPostDto>('id')
  },
  {
    isSearchable: false,
    label: 'Фото',
    initialWidth: 60,
    align: 'left',
    isImage: true,
    isSortable: false,
    fieldName: getPropertyOf<BlogPostDto>('medias')
  },
  {
    isSearchable: true,
    label: 'Заголовок поста',
    initialWidth: 300,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: `${getPropertyOf<BlogPostDto>('name')}.${getPropertyOf<MultilingualTextDto>(DEFAULT_LANG)}`
  },
  {
    isSearchable: true,
    label: 'Создан',
    initialWidth: 120,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<BlogPostDto>('createdAt')
  },
  {
    isSearchable: true,
    label: 'Категория',
    initialWidth: 200,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: `${getPropertyOf<BlogPostDto>('category')}.${getPropertyOf<LinkedBlogCategoryDto>('name')}.${getPropertyOf<MultilingualTextDto>(DEFAULT_LANG)}`
  },
  {
    isSearchable: false,
    label: 'Отображен на странице',
    initialWidth: 80,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: ''
  },
  {
    isSearchable: false,
    label: '',
    initialWidth: 100,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: ''
  }
]
