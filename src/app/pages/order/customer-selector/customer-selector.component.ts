import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CustomerDto } from '../../../shared/dtos/customer.dto';
import { CustomerService } from '../../../shared/services/customer.service';
import { IGridCell, IGridValue } from '../../../grid/grid.interface';
import { GridComponent } from '../../../grid/grid.component';
import { getPropertyOf } from '../../../shared/helpers/get-property-of.function';
import { ShipmentAddressDto } from '../../../shared/dtos/shipment-address.dto';
import { Subscription } from 'rxjs';
import { NotyService } from '../../../noty/noty.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'customer-selector',
  templateUrl: './customer-selector.component.html',
  styleUrls: ['./customer-selector.component.scss']
})
export class CustomerSelectorComponent implements OnInit, AfterViewInit {

  customers: CustomerDto[] = [];
  itemsTotal: number = 0;
  itemsFiltered: number;
  pagesTotal: number = 1;
  isGridLoading: boolean = false;
  gridCells: IGridCell[] = customerGridCells;

  private fetchAllSub: Subscription;

  @ViewChild(GridComponent) gridCmp: GridComponent;
  @Output('selected') selectedEmitter: EventEmitter<CustomerDto> = new EventEmitter();

  constructor(
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef,
    private notyService: NotyService
  ) { }

  ngOnInit() {
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

  selectCustomer(customer: CustomerDto) {
    this.selectedEmitter.emit(customer);
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
    initialWidth: 110,
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
    initialWidth: 115,
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
