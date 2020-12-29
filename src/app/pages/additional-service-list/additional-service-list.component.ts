import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgUnsubscribe } from '../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { Subscription } from 'rxjs';
import { getPropertyOf } from '../../shared/helpers/get-property-of.function';
import { IGridCell, IGridValue } from '../../grid/grid.interface';
import { GridComponent } from '../../grid/grid.component';
import { NotyService } from '../../noty/noty.service';
import { HeadService } from '../../shared/services/head.service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AdditionalServiceService } from '../../shared/services/additional-service.service';
import { AdditionalServiceDto } from '../../shared/dtos/additional-service.dto';
import { MultilingualTextDto } from '../../shared/dtos/multilingual-text.dto';
import { DEFAULT_LANG } from '../../shared/constants/constants';

@Component({
  selector: 'additional-service-list',
  templateUrl: './additional-service-list.component.html',
  styleUrls: ['./additional-service-list.component.scss']
})
export class AdditionalServiceListComponent extends NgUnsubscribe implements OnInit, AfterViewInit {

  private fetchAllSub: Subscription;

  additionalServices: AdditionalServiceDto[] = [];
  itemsTotal: number = 0;
  itemsFiltered: number;
  pagesTotal: number = 1;
  isGridLoading: boolean = false;
  gridLinkFieldName: string = getPropertyOf<AdditionalServiceDto>('id');
  gridCells: IGridCell[] = additionalServiceGridCells;
  lang = DEFAULT_LANG;

  @ViewChild(GridComponent) gridCmp: GridComponent;

  constructor(
    private additionalServiceService: AdditionalServiceService,
    private cdr: ChangeDetectorRef,
    private notyService: NotyService,
    private headService: HeadService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {
    this.headService.setTitle(`Дополнительные услуги`);
  }

  ngAfterViewInit() {
    const gridValue = this.gridCmp.getValue();
    this.fetchAdditionalServices(gridValue);
  }

  fetchAdditionalServices(gridValue: IGridValue) {
    if (this.fetchAllSub) { this.fetchAllSub.unsubscribe(); }

    this.isGridLoading = true;
    this.cdr.detectChanges();
    this.fetchAllSub = this.additionalServiceService.fetchAllAdditionalServices(gridValue)
      .pipe(this.notyService.attachNoty(), finalize(() => this.isGridLoading = false))
      .subscribe(
        response => {
          this.additionalServices = response.data;
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

const additionalServiceGridCells: IGridCell[] = [
  {
    isSearchable: true,
    label: 'ID',
    initialWidth: 70,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<AdditionalServiceDto>('id')
  },
  {
    isSearchable: true,
    label: 'Название',
    initialWidth: 300,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: `${getPropertyOf<AdditionalServiceDto>('name')}.${getPropertyOf<MultilingualTextDto>(DEFAULT_LANG)}`
  },
  {
    isSearchable: true,
    label: 'Название для клиента',
    initialWidth: 300,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: `${getPropertyOf<AdditionalServiceDto>('clientName')}.${getPropertyOf<MultilingualTextDto>(DEFAULT_LANG)}`
  },
  {
    isSearchable: true,
    label: 'Цена',
    initialWidth: 100,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<AdditionalServiceDto>('price')
  },
  {
    isSearchable: true,
    label: 'Состояние',
    initialWidth: 150,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<AdditionalServiceDto>('isEnabled')
  }
];
