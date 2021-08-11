import { Component, OnInit, ViewChild } from '@angular/core';
import { OrderDto } from '../../shared/dtos/order.dto';
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
import { DEFAULT_LANG, MANAGER_SELECT_OPTIONS } from '../../shared/constants/constants';
import { HeadService } from '../../shared/services/head.service';
import { NgUnsubscribe } from '../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { ManagerDto } from '../../shared/dtos/manager.dto';
import { AddOrderDto } from '../../shared/dtos/add-order.dto';
import { CustomerContactInfoComponent } from '../../customer-contact-info/customer-contact-info.component';
import { RecipientContactInfoComponent } from '../../recipient-contact-info/recipient-contact-info.component';
import { OrderPricesDto } from '../../shared/dtos/order-prices.dto';

@Component({
  selector: 'order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent extends NgUnsubscribe implements OnInit {

  lang = DEFAULT_LANG;
  isNewOrder: boolean;
  isReorder: boolean;
  isNewCustomer: boolean = false;
  isLoading: boolean = false;
  order: AddOrderDto;
  customer: CustomerDto;
  addressSelectControl: FormControl;
  addressSelectOptions: ISelectOption[] = [];
  managerSelectOptions: ISelectOption[] = MANAGER_SELECT_OPTIONS;
  customerAvgStoreReviewsRating: number = 0;
  customerAvgProductReviewsRating: number = 0;
  private newAddress: ShipmentAddressDto = new ShipmentAddressDto();
  private arePricesValid: boolean = true;

  @ViewChild(CustomerContactInfoComponent) customerContactInfoCmp: CustomerContactInfoComponent;
  @ViewChild(RecipientContactInfoComponent) recipientContactInfoCmp: RecipientContactInfoComponent;
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

    if (this.isNewOrder) {
      this.order = new AddOrderDto();
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
        switchMap(() => this.isReorder ? this.fetchCustomer(this.order.customerId) : EMPTY),
        finalize(() => this.isLoading = false)
      )
      .subscribe();
  }

  private fetchCustomer(customerId: number) {
    return this.customerService.fetchCustomer(customerId)
      .pipe( tap(response => this.selectCustomer(response.data)) );
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
      this.order = new AddOrderDto();

    } else {
      if (!confirm(`Вы уверены, что хотите отменить редактирование этого заказа?`)) {
        return;
      }

      this.navigateToOrderView();
    }
  }

  onPlaceOrder() {
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
    if (!this.customerContactInfoCmp.checkValidity()) {
      this.notyService.showErrorNoty(`Ошибка в форме клиента`);
      return;
    }
    if (!this.recipientContactInfoCmp.checkValidity()) {
      this.notyService.showErrorNoty(`Ошибка в форме получателя`);
      return;
    }
    if (!this.order.paymentMethodId) {
      this.notyService.showErrorNoty(`Не выбран способ оплаты`);
      return;
    }

    const dto: AddOrderDto = {
      ...this.order,
      customerContactInfo: this.customerContactInfoCmp.getValue(),
      recipientContactInfo: this.recipientContactInfoCmp.getValue(),
      address: this.addressFormCmp.getValue()
    };

    this.addNewOrder(dto);
  }

  private addNewOrder(dto: AddOrderDto) {
    this.isLoading = true;
    this.orderService.addNewOrder(dto)
      .pipe(
        this.notyService.attachNoty({ successText: 'Заказ успешно создан' }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        response => {
          this.order.id = response.data.id;
          this.navigateToOrderView();
        },
        error => console.warn(error)
      );
  }

  selectCustomer(customer: CustomerDto) {
    this.customer = customer;

    if (this.isNewOrder) {
      this.order.customerId = customer.id;
      this.order.customerContactInfo.firstName = customer.contactInfo.firstName;
      this.order.customerContactInfo.lastName = customer.contactInfo.lastName;
      this.order.customerContactInfo.middleName = customer.contactInfo.middleName;
      this.order.customerContactInfo.email = customer.contactInfo.email;
      this.order.customerContactInfo.phoneNumber = customer.contactInfo.phoneNumber;

      this.order.address = this.customer.addresses.find(a => a.isDefault) || this.customer.addresses[0] || this.newAddress;
    }

    this.handleAddressForm();
    if (!this.isNewCustomer) {
      this.getReviewsRating();
    }
  }

  createNewCustomer() {
    this.isNewCustomer = true;
    this.selectCustomer(new CustomerDto());
  }

  onPaymentMethodSelect(paymentMethod: PaymentMethodDto) {
    this.order.paymentMethodId = paymentMethod.id;
  }

  onOrderItemsChanged(items: OrderItemDto[]) {
    this.order.items = items;
    this.calculateOrderPrices();
  }

  onPricesChange(orderPrices: OrderPricesDto) {
    this.order.prices = orderPrices;
  }

  calculateOrderPrices() {
    this.arePricesValid = false;
    this.orderService.calculateOrderPrices(this.order.items, this.customer.id)
      .pipe(
        this.notyService.attachNoty(),
      )
      .subscribe(response => {
        this.order.prices = response.data;
        this.arePricesValid = true;
      });
  }

  private getReviewsRating() {
    this.customerService.fetchCustomerReviewsAvgRating(this.customer.id)
      .subscribe(
        response => {
          this.customerAvgStoreReviewsRating = response.data.storeReviews.avgRating;
          this.customerAvgProductReviewsRating = response.data.productReviews.avgRating;
        }
      );
  }

  private handleAddressForm() {
    this.addressSelectOptions = [
      { value: this.newAddress, view: 'Создать новый адрес' },
      ...this.customer.addresses.map(address => {
        let view = `${address.settlementNameFull || address.settlementName}, ${address.addressNameFull || address.addressName}`;
        if (address.buildingNumber) {
          view += `${address.buildingNumber}, ${address.flat}`;
        }

        return {
          value: address,
          view
        };
      })
    ];

    this.addressSelectControl = new FormControl(this.order.address);
    this.addressSelectControl.valueChanges
      .pipe( takeUntil(this.ngUnsubscribe) )
      .subscribe(value => this.order.address = value);
  }

  private setOrder(orderDto: OrderDto) {
    if (!orderDto.manager) {
      orderDto.manager = new ManagerDto();
    }

    if (this.isReorder) {
      this.headService.setTitle(`Повторить заказ №${orderDto.id}`);
    } else {
      this.headService.setTitle(`Изменить заказ №${orderDto.id}`);
    }

    this.order = {
      id: orderDto.id,
      customerId: orderDto.customerId,
      customerContactInfo: orderDto.customerContactInfo,
      recipientContactInfo: orderDto.shipment.recipient.contactInfo,
      address: orderDto.shipment.recipient.address,
      paymentMethodId: orderDto.paymentInfo.methodId,
      isCallbackNeeded: orderDto.isCallbackNeeded,
      items: orderDto.items,
      note: orderDto.notes.fromAdmin,
      manager: orderDto.manager,
      prices: orderDto.prices
    };
  }
}
