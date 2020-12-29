import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AttributeDto } from '../../shared/dtos/attribute.dto';
import { AttributeService } from '../../shared/services/attribute.service';
import { finalize } from 'rxjs/operators';
import { NgUnsubscribe } from '../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { IGridCell, IGridValue } from '../../grid/grid.interface';
import { getPropertyOf } from '../../shared/helpers/get-property-of.function';
import { Subscription } from 'rxjs';
import { GridComponent } from '../../grid/grid.component';
import { NotyService } from '../../noty/noty.service';
import { HeadService } from '../../shared/services/head.service';
import { DEFAULT_LANG } from '../../shared/constants/constants';
import { MultilingualTextDto } from '../../shared/dtos/multilingual-text.dto';


@Component({
  selector: 'attribute-list',
  templateUrl: './attribute-list.component.html',
  styleUrls: ['./attribute-list.component.scss']
})
export class AttributeListComponent extends NgUnsubscribe implements OnInit, AfterViewInit {

  private fetchAllSub: Subscription;

  attributes: AttributeDto[] = [];
  itemsTotal: number = 0;
  itemsFiltered: number;
  pagesTotal: number = 1;
  isGridLoading: boolean = false;
  gridLinkFieldName: string = getPropertyOf<AttributeDto>('id');
  gridCells: IGridCell[] = attributeGridCells;
  lang = DEFAULT_LANG;

  @ViewChild(GridComponent) gridCmp: GridComponent;

  constructor(
    private attributeService: AttributeService,
    private cdr: ChangeDetectorRef,
    private notyService: NotyService,
    private headService: HeadService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {
    this.headService.setTitle(`Атрибуты`);
  }

  ngAfterViewInit() {
    const gridValue = this.gridCmp.getValue();
    this.fetchAttributes(gridValue);
  }

  fetchAttributes(gridValue: IGridValue) {
    if (this.fetchAllSub) { this.fetchAllSub.unsubscribe(); }

    this.isGridLoading = true;
    this.cdr.detectChanges();
    this.fetchAllSub = this.attributeService.fetchAttributes(gridValue)
      .pipe(this.notyService.attachNoty(), finalize(() => this.isGridLoading = false))
      .subscribe(
        response => {
          this.attributes = response.data;
          this.itemsTotal = response.itemsTotal;
          this.pagesTotal = response.pagesTotal;
          this.itemsFiltered = response.itemsFiltered;
        }
      );
  }

  add() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }
}

const attributeGridCells: IGridCell[] = [
  {
    isSearchable: true,
    label: 'ID',
    initialWidth: 250,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<AttributeDto>('id')
  },
  {
    isSearchable: true,
    label: 'Label',
    initialWidth: 500,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: `${getPropertyOf<AttributeDto>('label')}.${getPropertyOf<MultilingualTextDto>(DEFAULT_LANG)}`
  }
];
