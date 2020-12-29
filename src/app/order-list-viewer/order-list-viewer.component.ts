import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { OrderDto } from '../shared/dtos/order.dto';
import { IGridCell, IGridValue } from '../grid/grid.interface';
import { DEFAULT_CURRENCY_CODE } from '../shared/enums/currency.enum';
import { GridComponent } from '../grid/grid.component';
import { OrderService } from '../shared/services/order.service';
import { ActivatedRoute } from '@angular/router';
import { NotyService } from '../noty/noty.service';
import { finalize } from 'rxjs/operators';
import { getPropertyOf } from '../shared/helpers/get-property-of.function';
import { ShipmentAddressDto } from '../shared/dtos/shipment-address.dto';
import { ShipmentDto } from '../shared/dtos/shipment.dto';
import { OrderStatusEnum } from '../shared/enums/order-status.enum';
import { ShipmentStatusEnum } from '../shared/enums/shipment-status.enum';
import { DEFAULT_LANG, TRANSLATIONS_MAP } from '../shared/constants/constants';
import { OrderPricesDto } from '../shared/dtos/order-prices.dto';

@Component({
  selector: 'order-list-viewer',
  templateUrl: './order-list-viewer.component.html',
  styleUrls: ['./order-list-viewer.component.scss']
})
export class OrderListViewerComponent implements OnInit, AfterViewInit {

  orders: OrderDto[] = [];
  itemsTotal: number = 0;
  itemsFiltered: number;
  pagesTotal: number = 1;
  isGridLoading: boolean = false;
  gridLinkUrl: string = '/admin/order/view';
  gridCells: IGridCell[] = orderGridCells;
  defaultCurrency = DEFAULT_CURRENCY_CODE;
  lang = DEFAULT_LANG;

  private fetchAllSub: Subscription;

  @Input() customerId: number;
  @Input() ids: number[];
  @ViewChild(GridComponent) gridCmp: GridComponent;

  constructor(
    private ordersService: OrderService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private notyService: NotyService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    if (!this.customerId && !this.ids?.length) { return; }

    const gridValue = this.gridCmp.getValue();
    this.fetchOrders(gridValue);
  }

  fetchOrders(gridValue: IGridValue) {
    if (this.fetchAllSub) { this.fetchAllSub.unsubscribe(); }

    gridValue.filters.push({ fieldName: 'id', value: this.ids.join('|') })

    this.isGridLoading = true;
    this.cdr.detectChanges();
    this.fetchAllSub = this.ordersService.fetchOrders(gridValue, { customerId: this.customerId })
      .pipe(this.notyService.attachNoty(), finalize(() => this.isGridLoading = false))
      .subscribe(
        response => {
          this.orders = response.data;
          this.itemsTotal = response.itemsTotal;
          this.itemsFiltered = response.itemsFiltered;
          this.pagesTotal = response.pagesTotal;
        },
        error => console.warn(error)
      );
  }
}

const shipmentProp = getPropertyOf<OrderDto>('shipment');
const recipientProp = getPropertyOf<ShipmentDto>('recipient');
const orderGridCells: IGridCell[] = [
  {
    isSearchable: false,
    label: 'ID',
    initialWidth: 40,
    align: 'center',
    isImage: true,
    isSortable: true,
    fieldName: getPropertyOf<OrderDto>('id')
  },
  {
    isSearchable: false,
    label: 'Дата',
    initialWidth: 78,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<OrderDto>('createdAt')
  },
  {
    isSearchable: true,
    label: 'Имя',
    initialWidth: 200,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: `${shipmentProp}.${recipientProp}.${getPropertyOf<ShipmentAddressDto>('lastName')}|${shipmentProp}.${recipientProp}.${getPropertyOf<ShipmentAddressDto>('firstName')}`
  },
  {
    isSearchable: true,
    label: 'Город',
    initialWidth: 100,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: `${shipmentProp}.${recipientProp}.${getPropertyOf<ShipmentAddressDto>('settlement')}`
  },
  {
    isSearchable: true,
    label: 'Сумма',
    initialWidth: 75,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: `${getPropertyOf<OrderDto>('prices')}.${getPropertyOf<OrderPricesDto>('totalCost')}`
  },
  {
    isSearchable: false,
    label: 'Статус',
    initialWidth: 130,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<OrderDto>('status'),
    filterFields: Object
      .values(OrderStatusEnum)
      .map(value => ({data: value, view: TRANSLATIONS_MAP[value]}))
  },
  {
    isSearchable: false,
    label: 'Статус посылки',
    initialWidth: 140,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: `${shipmentProp}.${getPropertyOf<ShipmentDto>('status')}`,
    filterFields: Object
      .values(ShipmentStatusEnum)
      .map(value => ({data: value, view: TRANSLATIONS_MAP[value]}))
  },
  {
    isSearchable: true,
    label: 'ТТН',
    initialWidth: 117,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: `${shipmentProp}.${getPropertyOf<ShipmentDto>('trackingNumber')}`
  },
  {
    isSearchable: true,
    label: 'Комментарий админа',
    initialWidth: 250,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<OrderDto>('adminNote')
  },
  {
    isSearchable: true,
    label: 'Комментарий клиента',
    initialWidth: 150,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<OrderDto>('clientNote')
  }
];
