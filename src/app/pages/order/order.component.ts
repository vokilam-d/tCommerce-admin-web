import { Component, OnInit, ViewChild } from '@angular/core';
import { AddOrUpdateOrderDto, OrderDto } from '../../shared/dtos/order.dto';
import { FormBuilder, FormControl } from '@angular/forms';
import { OrderService } from '../../shared/services/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotyService } from '../../noty/noty.service';
import { EPageAction } from '../../shared/enums/category-page-action.enum';
import { CustomerDto } from '../../shared/dtos/customer.dto';
import { OrderItemDto } from '../../shared/dtos/order-item.dto';
import { PaymentMethodDto } from '../../shared/dtos/payment-method.dto';
import { AddressFormComponent } from '../../address-form/address-form.component';
import { ISelectOption } from '../../shared/components/select/select-option.interface';
import { ShipmentAddressDto } from '../../shared/dtos/shipment-address.dto';
import { CustomerService } from '../../shared/services/customer.service';
import { ProductSelectorComponent } from '../../product-selector/product-selector.component';
import { DEFAULT_LANG, UPLOADED_HOST } from '../../shared/constants/constants';
import { HeadService } from '../../shared/services/head.service';
import { NgUnsubscribe } from '../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { catchError, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { EMPTY, forkJoin, Observable, of } from 'rxjs';
import { ResponseDto } from '../../shared/dtos/response.dto';

@Component({
  selector: 'order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent extends NgUnsubscribe implements OnInit {

  lang = DEFAULT_LANG;
  uploadedHost = UPLOADED_HOST;
  isNewOrder: boolean;
  isReorder: boolean;
  isEditOrder: boolean;
  isNewCustomer: boolean = false;
  isLoading: boolean = false;
  order: OrderDto;
  customer: CustomerDto;
  addressSelectControl: FormControl;
  addressSelectOptions: ISelectOption[] = [];
  private newAddress: ShipmentAddressDto = new ShipmentAddressDto();
  private arePricesValid: boolean = true;

  get isNewAddress(): boolean { return this.order.shipment.recipient === this.newAddress; }

  @ViewChild(ProductSelectorComponent) productSelectorCmp: ProductSelectorComponent;
  @ViewChild(AddressFormComponent) addressFormCmp: AddressFormComponent;

  constructor(
    private formBuilder: FormBuilder,
    private orderService: OrderService,
    private customerService: CustomerService,
    private router: Router,
    private headService: HeadService,
    private notyService: NotyService,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.init();
  }

  private init() {
    this.isNewOrder = this.route.snapshot.data.action === EPageAction.Add;
    this.isReorder = this.route.snapshot.data.action === EPageAction.AddBasedOn;
    this.isEditOrder = this.route.snapshot.data.action === EPageAction.Edit;

    if (this.isNewOrder) {
      this.order = new OrderDto();
      this.headService.setTitle(`Новый заказ`);
    } else {
      this.fetchOrder();
    }
  }

  private fetchOrder() {
    const id = this.route.snapshot.paramMap.get('id');

    this.isLoading = true;
    this.orderService.fetchOrder(id)
      .pipe(
        this.notyService.attachNoty(),
        tap(response => this.setOrder(response.data)),
        switchMap(() => this.isReorder || this.isEditOrder ? this.fetchCustomer(this.order.customerId) : EMPTY),
        switchMap(() => this.isReorder ? this.recreateOrderItems() : EMPTY),
        finalize(() => this.isLoading = false)
      )
      .subscribe();
  }

  private fetchCustomer(customerId: number) {
    return this.customerService.fetchCustomer(customerId)
      .pipe( tap(response => this.selectCustomer(response.data)) )
  }

  navigateToOrderList() {
    this.router.navigate(['admin', 'order']);
  }

  navigateToOrderView() {
    this.router.navigate(['admin', 'order', 'view', this.order.id]);
  }

  cancelEdit() {
    if (this.isNewOrder) {
      if (!confirm(`Вы уверены, что хотите отменить этот заказ?`)) {
        return;
      }

      this.customer = null;
      this.isNewCustomer = false;
      this.order = new OrderDto();

    } else {
      if (!confirm(`Вы уверены, что хотите отменить редактирование этого заказа?`)) {
        return;
      }

      this.navigateToOrderView();
    }
  }

  placeOrder() {
    if (!this.order.items.length) {
      this.notyService.showErrorNoty(`Не выбран ни один товар`);
      return;
    }
    if (!this.arePricesValid) {
      this.notyService.showErrorNoty(`Итоговые цены неактуальны. Попробуйте передобавить любой товар, или поменять кол-во`);
      return;
    }
    if (!this.addressFormCmp.checkValidity()) {
      this.notyService.showErrorNoty(`Ошибка в форме адреса`);
      return;
    }
    if (!this.order.paymentMethodId) {
      this.notyService.showErrorNoty(`Не выбран способ оплаты`);
      return;
    }

    const dto: AddOrUpdateOrderDto = {
      ...this.order,
      shipment: {
        ...this.order.shipment,
        recipient: this.addressFormCmp.getValue()
      }
    };


    if (this.isNewOrder || this.isReorder) {
      this.addNewOrder(dto);
    } else if (this.isEditOrder) {
      this.editOrder(dto);
    }
  }

  private addNewOrder(dto: AddOrUpdateOrderDto) {
    this.isLoading = true;
    this.orderService.addNewOrder(dto)
      .pipe(
        this.notyService.attachNoty({ successText: 'Заказ успешно создан' }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        response => {
          this.order = response.data;
          this.navigateToOrderView();
        },
        error => console.warn(error)
      );
  }

  private editOrder(dto: AddOrUpdateOrderDto) {
    this.isLoading = true;
    this.orderService.editOrder(this.order.id, dto)
      .pipe(
        this.notyService.attachNoty({ successText: 'Заказ успешно обновлён' }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        _ => this.navigateToOrderView(),
        error => console.warn(error)
      );
  }

  selectCustomer(customer: CustomerDto) {
    this.customer = customer;

    if (this.isNewOrder) {
      this.order.customerId = customer.id;
      this.order.customerFirstName = customer.firstName;
      this.order.customerLastName = customer.lastName;
      this.order.customerEmail = customer.email;
      this.order.customerPhoneNumber = customer.phoneNumber;

      this.order.shipment.recipient = this.customer.addresses.find(a => a.isDefault) || this.customer.addresses[0] || this.newAddress;
    }

    this.handleAddressForm();
  }

  createNewCustomer() {
    this.isNewCustomer = true;
    this.selectCustomer(new CustomerDto());
  }

  showProductSelector() {
    this.productSelectorCmp.showSelector();
  }

  onProductSelect({ variant, qty }) {
    const found = this.order.items.find(item => item.sku === variant.sku);
    if (found) {
      qty += found.qty;
    }

    this.createOrderItem(variant.sku, qty);
  }

  onOrderItemQtyBlur(target: any, orderItem: OrderItemDto) {
    const newValue = parseInt(target.value);
    if (!newValue) {
      target.value = orderItem.qty.toString();
      return;
    }

    this.createOrderItem(orderItem.sku, newValue);
  }

  createOrderItem(sku: string, qty: number) {
    this.isLoading = true;
    this.orderService.createOrderItem(sku, qty, this.isEditOrder)
      .pipe(
        this.notyService.attachNoty(),
        tap(response => this.addOrderItem(sku, response.data)),
        switchMap(() => this.calculateOrderPrices()),
        finalize(() => this.isLoading = false)
      )
      .subscribe();
  }

  recreateOrderItems() {
    const items = this.order.items.splice(0);

    const getItemRequest = (item: OrderItemDto): Observable<ResponseDto<OrderItemDto> | null> => this.orderService
      .createOrderItem(item.sku, item.qty, this.isEditOrder)
      .pipe(
        this.notyService.attachNoty(),
        tap((response) => this.addOrderItem(response.data.sku, response.data)),
        catchError(_ => of(null))
      );

    return forkJoin( ...items.map(getItemRequest) )
      .pipe( switchMap(() => this.calculateOrderPrices()) );
  }

  removeOrderItem(index: number) {
    this.order.items.splice(index, 1);

    this.isLoading = true;
    this.calculateOrderPrices()
      .pipe( finalize(() => this.isLoading = false) )
      .subscribe();
  }

  onPaymentMethodSelect(paymentMethod: PaymentMethodDto) {
    this.order.paymentMethodId = paymentMethod.id;
    this.order.paymentMethodClientName = paymentMethod.clientName;
    this.order.paymentMethodAdminName = paymentMethod.adminName;
  }

  private handleAddressForm() {
    this.addressSelectOptions = [
      { data: this.newAddress, view: 'Создать новый адрес' },
      ...this.customer.addresses.map(address => {
        let view = `${address.lastName} ${address.firstName}, ${address.settlement}, ${address.address}`;
        if (address.buildingNumber) {
          view += `${address.buildingNumber}, ${address.flat}`;
        }

        return {
          data: address,
          view
        };
      })
    ];

    this.addressSelectControl = new FormControl(this.order.shipment.recipient);
    this.addressSelectControl.valueChanges
      .pipe( takeUntil(this.ngUnsubscribe) )
      .subscribe(value => this.order.shipment.recipient = value)
  }

  private setOrder(orderDto: OrderDto) {
    if (!this.isReorder) {
      this.headService.setTitle(`Изменить заказ №${orderDto.id}`);
      this.order = orderDto;
      return;
    }

    this.headService.setTitle(`Повторить заказ №${orderDto.id}`);
    this.order = {
      id: orderDto.id,
      customerEmail: orderDto.customerEmail,
      customerFirstName: orderDto.customerFirstName,
      customerLastName: orderDto.customerLastName,
      customerId: orderDto.customerId,
      customerPhoneNumber: orderDto.customerPhoneNumber,
      items: orderDto.items,
      paymentType: orderDto.paymentType,
      paymentMethodId: orderDto.paymentMethodId,
      paymentMethodAdminName: orderDto.paymentMethodAdminName,
      paymentMethodClientName: orderDto.paymentMethodClientName,
      shippingMethodName: orderDto.shippingMethodName,
      isCallbackNeeded: orderDto.isCallbackNeeded,
      shipment: {
        senderId: orderDto.shipment.senderId,
        recipient: orderDto.shipment.recipient,
        shipmentType: orderDto.shipment.shipmentType,
        payerType: orderDto.shipment.payerType,
        paymentMethod: orderDto.shipment.paymentMethod
      },
      prices: {
        discountPercent: orderDto.prices.discountPercent,
        discountValue: orderDto.prices.discountValue,
        discountLabel: orderDto.prices.discountLabel,
        totalCost: orderDto.prices.totalCost,
        itemsCost: orderDto.prices.itemsCost
      }
    } as OrderDto;
  }

  private addOrderItem(sku: string, item: OrderItemDto) {
    const foundIdx = this.order.items.findIndex(item => item.sku === sku);
    if (foundIdx === -1) {
      this.order.items.push(item);
    } else {
      this.order.items[foundIdx] = item;
    }
  }

  onDiscountValueChange(target: any) {
    const discountValue = parseInt(target.value);
    this.order.prices.totalCost = this.order.prices.itemsCost - discountValue;
  }

  calculateOrderPrices() {
    this.arePricesValid = false;
    return this.orderService.calculateOrderPrices(this.order.items, this.customer.id)
      .pipe(
        this.notyService.attachNoty(),
        tap(response => {
          this.order.prices = response.data;
          this.arePricesValid = true;
        })
      );
  }
}
