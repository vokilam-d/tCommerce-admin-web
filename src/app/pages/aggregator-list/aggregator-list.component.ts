import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgUnsubscribe } from '../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { Subscription } from 'rxjs';
import { AggregatorDto } from '../../shared/dtos/aggregator.dto';
import { getPropertyOf } from '../../shared/helpers/get-property-of.function';
import { IGridCell, IGridValue } from '../../grid/grid.interface';
import { GridComponent } from '../../grid/grid.component';
import { NotyService } from '../../noty/noty.service';
import { HeadService } from '../../shared/services/head.service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AggregatorService } from '../../shared/services/aggregator.service';
import { DEFAULT_LANG } from '../../shared/constants/constants';
import { MultilingualTextDto } from '../../shared/dtos/multilingual-text.dto';

@Component({
  selector: 'aggregator-list',
  templateUrl: './aggregator-list.component.html',
  styleUrls: ['./aggregator-list.component.scss']
})
export class AggregatorListComponent extends NgUnsubscribe implements OnInit, AfterViewInit {

  private fetchAllSub: Subscription;

  aggregators: AggregatorDto[] = [];
  itemsTotal: number = 0;
  itemsFiltered: number;
  pagesTotal: number = 1;
  isGridLoading: boolean = false;
  gridLinkFieldName: string = getPropertyOf<AggregatorDto>('id');
  gridCells: IGridCell[] = aggregatorGridCells;
  lang = DEFAULT_LANG;

  @ViewChild(GridComponent) gridCmp: GridComponent;

  constructor(
    private aggregatorService: AggregatorService,
    private cdr: ChangeDetectorRef,
    private notyService: NotyService,
    private headService: HeadService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {
    this.headService.setTitle(`Агрегаторы`);
  }

  ngAfterViewInit() {
    const gridValue = this.gridCmp.getValue();
    this.fetchAggregators(gridValue);
  }

  fetchAggregators(gridValue: IGridValue) {
    if (this.fetchAllSub) { this.fetchAllSub.unsubscribe(); }

    this.isGridLoading = true;
    this.cdr.detectChanges();
    this.fetchAllSub = this.aggregatorService.fetchAllAggregators(gridValue)
      .pipe(this.notyService.attachNoty(), finalize(() => this.isGridLoading = false))
      .subscribe(
        response => {
          this.aggregators = response.data;
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

const aggregatorGridCells: IGridCell[] = [
  {
    isSearchable: true,
    label: 'ID',
    initialWidth: 70,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<AggregatorDto>('id')
  },
  {
    isSearchable: true,
    label: 'Название',
    initialWidth: 300,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: `${getPropertyOf<AggregatorDto>('name')}.${getPropertyOf<MultilingualTextDto>(DEFAULT_LANG)}`
  },
  {
    isSearchable: true,
    label: 'Название таблицы для клиента',
    initialWidth: 300,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: `${getPropertyOf<AggregatorDto>('clientName')}.${getPropertyOf<MultilingualTextDto>(DEFAULT_LANG)}`
  }
];
