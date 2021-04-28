import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { OrderDto } from '../../shared/dtos/order.dto';
import { OrderService } from '../../shared/services/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotyService } from '../../noty/noty.service';
import { IGridCell, IGridValue } from '../../grid/grid.interface';
import { GridComponent } from '../../grid/grid.component';
import { getPropertyOf } from '../../shared/helpers/get-property-of.function';
import { ShipmentAddressDto } from '../../shared/dtos/shipment-address.dto';
import { Subscription } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { DEFAULT_CURRENCY_CODE } from '../../shared/enums/currency.enum';
import { HeadService } from '../../shared/services/head.service';
import { ShipmentDto } from '../../shared/dtos/shipment.dto';
import { FormControl } from '@angular/forms';
import { NgUnsubscribe } from '../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { OrderStatusEnum } from '../../shared/enums/order-status.enum';
import { ShipmentStatusEnum } from '../../shared/enums/shipment-status.enum';
import { DEFAULT_LANG, MANAGER_SELECT_OPTIONS, TRANSLATIONS_MAP } from '../../shared/constants/constants';
import { PaymentMethodEnum } from '../../shared/enums/payment-method.enum';
import { OrderPricesDto } from '../../shared/dtos/order-prices.dto';
import { copyToClipboard } from '../../shared/helpers/copy-to-clipboard.function';
import { DatePipe } from '@angular/common';
import { ReadableCurrencyPipe } from '../../shared/pipes/readable-currency.pipe';
import { MultilingualTextDto } from '../../shared/dtos/multilingual-text.dto';
import { ManagerDto } from '../../shared/dtos/manager.dto';
import { ShipmentCounterpartyDto } from '../../shared/dtos/shipment-counterparty.dto';
import { ContactInfoDto } from '../../shared/dtos/contact-info.dto';
import { OrderNotesDto } from '../../shared/dtos/order-notes.dto';
import { OrderPaymentInfoDto } from '../../shared/dtos/order-payment-info.dto';
import { ShipmentSenderService } from '../../shared/services/shipment-sender.service';

@Component({
  selector: 'order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent extends NgUnsubscribe implements OnInit, AfterViewInit {

  paymentTypes = PaymentMethodEnum;
  orders: OrderDto[] = [];
  itemsTotal: number = 0;
  itemsFiltered: number;
  pagesTotal: number = 1;
  isGridLoading: boolean = false;
  gridLinkUrl: string = 'view';
  gridCells: IGridCell[] = [];
  defaultCurrency = DEFAULT_CURRENCY_CODE;
  lang = DEFAULT_LANG;
  statusControl = new FormControl();

  private fetchAllSub: Subscription;

  @ViewChild(GridComponent) gridCmp: GridComponent;

  constructor(
    private ordersService: OrderService,
    private shipmentSenderService: ShipmentSenderService,
    private route: ActivatedRoute,
    private headService: HeadService,
    private cdr: ChangeDetectorRef,
    private notyService: NotyService,
    private router: Router,
    private datePipe: DatePipe,
    private readableCurrencyPipe: ReadableCurrencyPipe
  ) {
    super();
  }

  ngOnInit() {
    this.headService.setTitle(`Заказы`);
    this.handleStatusControl();
    this.setGridCells();
  }

  ngAfterViewInit(): void {
    this.fetchOrders();
  }

  add() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  fetchOrders(gridValue: IGridValue = this.gridCmp.getValue()) {
    if (this.fetchAllSub) { this.fetchAllSub.unsubscribe(); }

    const hasStatusFilter = this.statusControl.value;
    if (hasStatusFilter) {
      const statusProp: keyof OrderDto = 'status';
      const statusToFilter: OrderStatusEnum = OrderStatusEnum.READY_TO_SHIP;
      gridValue.filters.push({ fieldName: statusProp, value: statusToFilter })
    }

    this.isGridLoading = true;
    this.cdr.detectChanges();
    this.fetchAllSub = this.ordersService.fetchOrders(gridValue)
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

  hasDifferentName(order: OrderDto): string {
    if (!order.customerContactInfo.firstName && !order.customerContactInfo.lastName) {
      return;
    }
    if (
      order.customerContactInfo.firstName === order.shipment.recipient.contactInfo.firstName
      && order.customerContactInfo.lastName === order.shipment.recipient.contactInfo.lastName
    ) {
      return;
    }

    return `${order.customerContactInfo.firstName} ${order.customerContactInfo.lastName}`;
  }

  copyOrdersToClipboard() {
    const headerStr: string = orderGridCells
      .map(cell => cell.label)
      .join('\t');

    const ordersStrArray = this.orders
      .map(order => {
        const fields: (string | number)[] = [
          order.id,
          `${this.datePipe.transform(order.createdAt, 'dd.MM.y')} ${this.datePipe.transform(order.createdAt, 'HH:mm:ss')}`,
          `${order.shipment.recipient.contactInfo.firstName} ${order.shipment.recipient.contactInfo.lastName} ${order.shipment.recipient.contactInfo.phoneNumber}`,
          order.shipment.recipient.address.addressName,
          `${order.prices.totalCost} ${this.readableCurrencyPipe.transform(this.defaultCurrency)}`,
          order.notes.fromAdmin,
          order.statusDescription[DEFAULT_LANG],
          order.shipment.statusDescription,
          `${this.datePipe.transform(order.shippedAt, 'dd.MM.y')} ${this.datePipe.transform(order.shippedAt, 'HH:mm:ss')}`,
          order.shipment.trackingNumber,
          `${order.isOrderPaid ? 'Да' : 'Нет'}`,
          order.paymentInfo.methodAdminName[DEFAULT_LANG],
          `${order.isCallbackNeeded ? 'Да' : 'Нет'}`,
          order.notes.fromCustomer,
          `${order.shipment.sender.contactInfo.firstName} ${order.shipment.sender.contactInfo.lastName}`,
          order.manager.name,
          `${order.source === 'client' ? 'Клиент' : 'Менеджер'}`,
          order.notes.aboutCustomer
        ];
        return fields.join('\t');
      });

    const ordersStr = [headerStr, ...ordersStrArray].join('\n');
    copyToClipboard(ordersStr);
    this.notyService.showSuccessNoty(`Скопировано "${ordersStrArray.length}" заказов`);
  }

  private handleStatusControl() {
    this.statusControl.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(_ => this.fetchOrders());
  }

  private setGridCells(): void {
    this.shipmentSenderService.fetchAllSenders()
      .pipe(this.takeUntilDestroy())
      .subscribe(
        response => {
          const senderCellIdx = orderGridCells.findIndex(cell => cell.label === senderLabel);
          if (senderCellIdx > -1) {
            orderGridCells[senderCellIdx].filterFields = response.data
              .map(sender => ({
                data: sender.senderId,
                view: sender.firstName
              }))
              .filter((option, index, arr) => arr.findIndex(el => el.data === option.data) === index);
          }

          this.gridCells = orderGridCells;
        },
        error => {
          this.gridCells = orderGridCells;
        }
      );
  }
}

const senderLabel = 'Отправитель';
const shipmentProp = getPropertyOf<OrderDto>('shipment');
const senderProp = getPropertyOf<ShipmentDto>('sender');
const recipientProp = getPropertyOf<ShipmentDto>('recipient');
const counterPartyContactInfoProp = getPropertyOf<ShipmentCounterpartyDto>('contactInfo');
const counterPartyAddressProp = getPropertyOf<ShipmentCounterpartyDto>('address');
const orderGridCells: IGridCell[] = [
  {
    isSearchable: true,
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
    initialWidth: 90,
    align: 'left',
    isSortable: true,
    fieldName: getPropertyOf<OrderDto>('createdAt'),
    hasDateFromFilter: true,
    hasDateToFilter: true
  },
  {
    isSearchable: true,
    label: 'Получатель',
    placeholder: 'Фамилия или телефон',
    initialWidth: 150,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: `${shipmentProp}.${recipientProp}.${counterPartyContactInfoProp}.${getPropertyOf<ContactInfoDto>('lastName')}|${shipmentProp}.${recipientProp}.${counterPartyContactInfoProp}.${getPropertyOf<ContactInfoDto>('phoneNumber')}`
  },
  {
    isSearchable: true,
    label: 'Город',
    initialWidth: 80,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: `${shipmentProp}.${recipientProp}.${counterPartyAddressProp}.${getPropertyOf<ShipmentAddressDto>('settlementName')}|${shipmentProp}.${recipientProp}.${counterPartyAddressProp}.${getPropertyOf<ShipmentAddressDto>('settlementNameFull')}`
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
    isSearchable: true,
    label: 'Комментарий админа о заказе',
    initialWidth: 150,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: `${getPropertyOf<OrderDto>('notes')}.${getPropertyOf<OrderNotesDto>('fromAdmin')}`
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
    isSearchable: false,
    label: 'Дата отправки',
    initialWidth: 90,
    align: 'left',
    isSortable: true,
    fieldName: getPropertyOf<OrderDto>('shippedAt'),
    hasDateFromFilter: true,
    hasDateToFilter: true
  },
  {
    isSearchable: true,
    label: 'ТТН',
    initialWidth: 112,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: `${shipmentProp}.${getPropertyOf<ShipmentDto>('trackingNumber')}`
  },
  {
    isSearchable: false,
    label: 'Оплачено?',
    initialWidth: 75,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<OrderDto>('isOrderPaid')
  },
  {
    isSearchable: true,
    label: 'Способ оплаты',
    initialWidth: 140,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: `${getPropertyOf<OrderDto>('paymentInfo')}.${getPropertyOf<OrderPaymentInfoDto>('methodAdminName')}.${getPropertyOf<MultilingualTextDto>(DEFAULT_LANG)}`
  },
  {
    isSearchable: false,
    label: 'Перезванивать?',
    initialWidth: 75,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<OrderDto>('isCallbackNeeded')
  },
  {
    isSearchable: true,
    label: 'Комментарий клиента к заказу',
    initialWidth: 120,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: `${getPropertyOf<OrderDto>('notes')}.${getPropertyOf<OrderNotesDto>('fromCustomer')}`
  },
  {
    label: senderLabel,
    initialWidth: 85,
    align: 'left',
    isSortable: true,
    fieldName: `${shipmentProp}.${senderProp}.${getPropertyOf<ShipmentCounterpartyDto>('id')}`,
    filterFields: []
  },
  {
    isSearchable: false,
    label: 'Менеджер',
    initialWidth: 105,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: `${getPropertyOf<OrderDto>('manager')}.${getPropertyOf<ManagerDto>('userId')}`,
    filterFields: MANAGER_SELECT_OPTIONS
  },
  {
    isSearchable: false,
    label: 'Оформил',
    initialWidth: 105,
    align: 'left',
    isImage: false,
    isSortable: true,
    fieldName: getPropertyOf<OrderDto>('source'),
    filterFields: [
      { data: 'client', view: 'Клиент' },
      { data: 'manager', view: 'Менеджер' }
    ]
  },
  {
    isSearchable: true,
    label: 'Коммент о клиенте',
    initialWidth: 65,
    align: 'left',
    isImage: false,
    isSortable: false,
    fieldName: `${getPropertyOf<OrderDto>('notes')}.${getPropertyOf<OrderNotesDto>('aboutCustomer')}`
  },
];
