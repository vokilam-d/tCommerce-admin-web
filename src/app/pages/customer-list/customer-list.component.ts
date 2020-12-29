import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CustomerDto } from '../../shared/dtos/customer.dto';
import { CustomerService } from '../../shared/services/customer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotyService } from '../../noty/noty.service';
import { IGridCell, IGridValue } from '../../grid/grid.interface';
import { getPropertyOf } from '../../shared/helpers/get-property-of.function';
import { ShipmentAddressDto } from '../../shared/dtos/shipment-address.dto';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { GridComponent } from '../../grid/grid.component';
import { AttributeDto } from '../../shared/dtos/attribute.dto';
import { HeadService } from '../../shared/services/head.service';


@Component({
  selector: 'customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit, AfterViewInit {

  customers: CustomerDto[] = [];
  itemsTotal: number = 0;
  itemsFiltered: number;
  pagesTotal: number = 1;
  isGridLoading: boolean = false;
  idFieldName = getPropertyOf<AttributeDto>('id');
  gridCells: IGridCell[] = customerGridCells;

  private fetchAllSub: Subscription;

  @ViewChild(GridComponent) gridCmp: GridComponent;

  constructor(
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private headService: HeadService,
    private cdr: ChangeDetectorRef,
    private notyService: NotyService,
    private router: Router
  ) { }

  ngOnInit() {
    this.headService.setTitle(`Клиенты`);
  }

  ngAfterViewInit() {
    const gridValue = this.gridCmp.getValue();
    this.fetchCustomers(gridValue);
  }

  fetchCustomers(gridValue: IGridValue) {
    if (this.fetchAllSub) { this.fetchAllSub.unsubscribe(); }

    this.isGridLoading = true;
    this.cdr.detectChanges();
    this.fetchAllSub = this.customerService.fetchAllCustomers(gridValue)
      .pipe(this.notyService.attachNoty(), finalize(() => this.isGridLoading = false))
      .subscribe(
        response => {
          this.customers = response.data;
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

const customerGridCells: IGridCell[] = [
  {
    isSearchable: false,
    label: 'ID',
    initialWidth: 50,
    align: 'center',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<CustomerDto>('id')
  },
  {
    isSearchable: true,
    label: 'Имя',
    initialWidth: 200,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: `${getPropertyOf<CustomerDto>('firstName')}|${getPropertyOf<CustomerDto>('lastName')}`
  },
  {
    isSearchable: true,
    label: 'Email',
    initialWidth: 250,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: getPropertyOf<CustomerDto>('email')
  },
  {
    isSearchable: true,
    label: 'Телефон',
    initialWidth: 100,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: getPropertyOf<CustomerDto>('phoneNumber')
  },
  {
    isSearchable: true,
    label: 'Город',
    initialWidth: 100,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: `${getPropertyOf<CustomerDto>('addresses')}.${getPropertyOf<ShipmentAddressDto>('settlement')}`
  },
  {
    isSearchable: false,
    label: 'Дата рег-ции',
    initialWidth: 100,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<CustomerDto>('createdAt')
  },
  {
    isSearchable: true,
    label: 'Комментарий о клиенте',
    initialWidth: 150,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: getPropertyOf<CustomerDto>('note')
  }
];
