import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotyService } from '../../noty/noty.service';
import { SupplierDto } from '../../shared/dtos/supplier.dto';
import { SupplierService } from '../../shared/services/supplier.service';
import { IGridCell, IGridValue } from '../../grid/grid.interface';
import { getPropertyOf } from '../../shared/helpers/get-property-of.function';
import { Subscription } from 'rxjs';
import { GridComponent } from '../../grid/grid.component';
import { finalize } from 'rxjs/operators';
import { HeadService } from '../../shared/services/head.service';

@Component({
  selector: 'supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.scss']
})
export class SupplierListComponent implements OnInit, AfterViewInit {

  suppliers: SupplierDto[] = [];
  itemsTotal: number = 0;
  itemsFiltered: number;
  pagesTotal: number = 1;
  isGridLoading: boolean = false;
  idFieldName = getPropertyOf<SupplierDto>('id');
  gridCells: IGridCell[] = suppliersGridCells;

  private fetchAllSub: Subscription;

  @ViewChild(GridComponent) gridCmp: GridComponent;

  constructor(
    private suppliersService: SupplierService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private headService: HeadService,
    private notyService: NotyService,
    private router: Router
  ) { }

  ngOnInit() {
    this.headService.setTitle(`Поставщики`);
  }

  ngAfterViewInit(): void {
    const gridValue = this.gridCmp.getValue();
    this.fetchSuppliers(gridValue);
  }

  fetchSuppliers(gridValue: IGridValue) {
    if (this.fetchAllSub) { this.fetchAllSub.unsubscribe(); }

    this.isGridLoading = true;
    this.cdr.detectChanges();
    this.fetchAllSub = this.suppliersService.fetchAllSuppliers(gridValue)
      .pipe(this.notyService.attachNoty(), finalize(() => this.isGridLoading = false))
      .subscribe(
        response => {
          this.suppliers = response.data;
          this.itemsTotal = response.itemsTotal;
          this.pagesTotal = response.pagesTotal;
        },
        error => console.warn(error)
      );
  }

  add() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }
}

const suppliersGridCells: IGridCell[] = [
  {
    isSearchable: true,
    label: 'ID',
    initialWidth: 50,
    align: 'center',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<SupplierDto>('id')
  },
  {
    isSearchable: true,
    label: 'Название',
    initialWidth: 400,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<SupplierDto>('name')
  }
];
