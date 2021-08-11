import { Component, OnInit, ViewChild } from '@angular/core';
import { OrderService } from '../../shared/services/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderDto } from '../../shared/dtos/order.dto';
import { CustomerDto } from '../../shared/dtos/customer.dto';
import { CustomerService } from '../../shared/services/customer.service';
import { NotyService } from '../../noty/noty.service';
import { AddressFormComponent } from '../../address-form/address-form.component';
import { saveFileFromUrl } from '../../shared/helpers/save-file.function';
import {
  API_HOST,
  DEFAULT_ERROR_TEXT,
  DEFAULT_LANG,
  MANAGER_SELECT_OPTIONS,
  UPLOADED_HOST
} from '../../shared/constants/constants';
import { FormControl } from '@angular/forms';
import { HeadService } from '../../shared/services/head.service';
import { FinalOrderStatuses, OrderStatusEnum } from '../../shared/enums/order-status.enum';
import { ShipmentInfoModalComponent } from './shipment-info-modal/shipment-info-modal.component';
import { ShipmentDto } from '../../shared/dtos/shipment.dto';
import { catchError, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { PaymentMethodEnum } from '../../shared/enums/payment-method.enum';
import { NgUnsubscribe } from '../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { ShipmentStatusEnum } from '../../shared/enums/shipment-status.enum';
import { OrderItemDto } from '../../shared/dtos/order-item.dto';
import { copyToClipboard } from '../../shared/helpers/copy-to-clipboard.function';
import { ISelectOption } from '../../shared/components/select/select-option.interface';
import { InvoiceModalComponent } from './invoice-modal/invoice-modal.component';
import { InvoiceEditDto } from '../../shared/dtos/invoice-edit.dto';
import { ConfirmPackItemModalComponent } from './confirm-pack-item-modal/confirm-pack-item-modal.component';
import { CreateInternetDocumentDto } from '../../shared/dtos/create-internet-document.dto';
import { ContactInfoDto } from '../../shared/dtos/contact-info.dto';
import { ContactInfoModalComponent } from './contact-info-modal/contact-info-modal.component';
import { ResponseDto } from '../../shared/dtos/response.dto';
import { TaxReceiptRepresentationType } from '../../shared/enums/tax/tax-receipt-representation-type.enum';
import { TaxService } from '../../shared/services/tax.service';
import { OrderPricesModalComponent } from '../../order-prices-modal/order-prices-modal.component';
import { OrderPricesDto } from '../../shared/dtos/order-prices.dto';
import { OrderItemsModalComponent } from '../../order-items-modal/order-items-modal.component';

@Component({
  selector: 'order-view',
  templateUrl: './order-view.component.html',
  styleUrls: ['./order-view.component.scss']
})
export class OrderViewComponent extends NgUnsubscribe implements OnInit {

  lang = DEFAULT_LANG;
  order: OrderDto;
  customer: CustomerDto;
  isAddressFormVisible: boolean = false;
  trackingIdControl: FormControl;
  adminNoteControl: FormControl;
  paymentStatusControl: FormControl;
  orderManagerControl: FormControl;
  paymentStatusError: string | null = null;
  isLoading: boolean = false;
  isPdfButtonsVisible: boolean = false;
  isOperationsButtonsVisible: boolean = false;
  customerAvgStoreReviewsRating: number = 0;
  customerAvgProductReviewsRating: number = 0;

  orderStatuses = OrderStatusEnum;
  managerSelectOptions: ISelectOption[] = MANAGER_SELECT_OPTIONS;

  @ViewChild(AddressFormComponent) addressFormCmp: AddressFormComponent;
  @ViewChild(ShipmentInfoModalComponent) shipmentInfoModalCmp: ShipmentInfoModalComponent;
  @ViewChild(InvoiceModalComponent) invoiceModalCmp: InvoiceModalComponent;
  @ViewChild(ConfirmPackItemModalComponent) confirmPackCmp: ConfirmPackItemModalComponent;
  @ViewChild(ContactInfoModalComponent) contactInfoModalCmp: ContactInfoModalComponent;
  @ViewChild(OrderPricesModalComponent) orderPricesModalCmp: OrderPricesModalComponent;
  @ViewChild(OrderItemsModalComponent) orderItemsModalCmp: OrderItemsModalComponent;

  get nextOrderStatus(): OrderStatusEnum | null {
    switch (this.order.status) {
      case OrderStatusEnum.NEW:
        return OrderStatusEnum.PROCESSING;
      case OrderStatusEnum.PROCESSING:
        return OrderStatusEnum.READY_TO_PACK;
      default:
        return null;
    }
  }

  get isDeliveryDateVisible(): boolean {
    return this.order?.shipment.status === ShipmentStatusEnum.IN_CITY
      || this.order?.shipment.status === ShipmentStatusEnum.HEADING_TO_CITY
      || this.order?.shipment.status === ShipmentStatusEnum.IN_DESTINATION_CITY
      || this.order?.shipment.status === ShipmentStatusEnum.HEADING_TO_RECIPIENT;
  }

  constructor(
    private orderService: OrderService,
    private customerService: CustomerService,
    private notyService: NotyService,
    private headService: HeadService,
    private router: Router,
    private route: ActivatedRoute,
    private taxService: TaxService
  ) {
    super();
  }

  ngOnInit() {
    this.init();
  }

  private init() {
    const id  = this.route.snapshot.paramMap.get('id');
    this.isLoading = true;
    this.orderService.fetchOrder(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(
        response => {
          this.order = response.data;
          this.handlePaymentStatusControl();
          this.fetchCustomer(this.order.customerId);
          this.headService.setTitle(`Заказ №${this.order.id}`);
          this.handleManagerControl();
        }
      );
  }

  private handleManagerControl() {
    this.orderManagerControl = new FormControl(this.order.manager.userId);
    this.orderManagerControl.valueChanges
      .pipe( takeUntil(this.ngUnsubscribe) )
      .subscribe(userId => this.updateOrderManager(userId));
  }

  private fetchCustomer(customerId: number) {
    this.isLoading = true;
    this.customerService.fetchCustomer(customerId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(
        response => {
          this.customer = response.data;
        }
      );

    this.customerService.fetchCustomerReviewsAvgRating(customerId)
      .subscribe(
        response => {
          this.customerAvgStoreReviewsRating = response.data.storeReviews.avgRating;
          this.customerAvgProductReviewsRating = response.data.productReviews.avgRating;
        }
      );
  }

  goBack() {
    this.router.navigate(['admin', 'order']);
  }

  cancelOrder() {
    if (!confirm(`Вы уверены, что хотите отменить заказ?`)) {
      return;
    }

    this.changeStatus(OrderStatusEnum.CANCELED);
  }

  reorder() {
    this.router.navigate(['admin', 'order', 'add', 'based-on', this.order.id]);
  }

  printOrder() {
    const url = this.orderService.getPrintOrderUrl(this.order.id);
    saveFileFromUrl(url);
  }

  printInvoice(editDto: InvoiceEditDto) {
    const queryString = Object.entries(editDto)
      .filter(([key, value]) => value !== '')
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    console.log(queryString);

    const url = this.orderService.getPrintInvoiceUrl(this.order.id);
    saveFileFromUrl(`${url}?${queryString}`);
  }

  deleteOrder() {
    if (!confirm(`Вы уверены, что хотите удалить этот заказ?`)) { return; }
    if (!confirm(`Вы точно уверены?`)) { return; }

    this.isLoading = true;
    this.orderService.deleteOrder(this.order.id)
      .pipe(
        this.notyService.attachNoty({ successText: `Заказ #${this.order.id} успешно удалён` }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(_ => this.goBack());
  }

  isCancelOrderVisible(): boolean {
    return !FinalOrderStatuses.includes(this.order.status)
      && this.order.status !== OrderStatusEnum.SHIPPED
      && this.order.status !== OrderStatusEnum.CANCELED;
  }

  isCreateInternetDocumentVisible(): boolean {
    return this.order.status === OrderStatusEnum.READY_TO_PACK;
  }

  isReturnBtnsVisible(): boolean {
    return this.order.status === OrderStatusEnum.RECIPIENT_DENIED;
  }

  isFinishOrderVisible(): boolean {
    return this.order.status !== OrderStatusEnum.FINISHED && this.order.status !== OrderStatusEnum.CANCELED;
  }

  isTrackingNumberAvailable(): boolean {
    return !this.trackingIdControl && this.order.status !== OrderStatusEnum.READY_TO_PACK && this.order.status !== OrderStatusEnum.PROCESSING && this.order.status !== OrderStatusEnum.NEW;
  }

  openAddressForm() {
    this.isAddressFormVisible = true;
  }

  closeAddressForm() {
    this.isAddressFormVisible = false;
  }

  submitAddressForm() {
    if (!this.addressFormCmp.checkValidity()) {
      return;
    }

    const address = this.addressFormCmp.getValue();
    this.isLoading = true;
    this.orderService.updateOrderAddress(this.order.id, address)
      .pipe(
        this.notyService.attachNoty({ successText: 'Адрес в заказе успешно обновлён' }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        response => {
          this.order = response.data;
          this.closeAddressForm();
        }
      );
  }

  openTrackingIdForm() {
    this.trackingIdControl = new FormControl(this.order.shipment.trackingNumber);
  }

  closeTrackingIdForm() {
    this.trackingIdControl = null;
  }

  updateTrackingId() {
    const trackingNumber = this.trackingIdControl.value;
    this.isLoading = true;
    this.orderService.updateOrderTrackingId(this.order.id, trackingNumber)
      .pipe(
        this.notyService.attachNoty({ successText: 'Номер ТТН успешно обновлён' }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        response => {
          this.order = response.data;
          this.closeTrackingIdForm();
        }
      );
  }

  openAdminNoteForm() {
    this.adminNoteControl = new FormControl(this.order.notes.fromAdmin);
  }

  closeAdminNoteForm() {
    this.adminNoteControl = null;
  }

  updateAdminNote() {
    const adminNote = this.adminNoteControl.value;
    this.isLoading = true;
    this.orderService.updateOrderAdminNote(this.order.id, adminNote)
      .pipe(
        this.notyService.attachNoty({ successText: 'Комментарий менеджера успешно обновлён' }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        response => {
          this.order = response.data;
          this.closeAdminNoteForm();
        }
      );
  }

  updateOrderManager(userId) {
    this.isLoading = true;
    this.orderService.updateOrderManager(this.order.id, userId)
      .pipe(
        this.notyService.attachNoty({ successText: 'Менеджер успешно изменён' }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        response => {
          this.order = response.data;
        }
      );
  }

  openShipmentInfo() {
    this.shipmentInfoModalCmp.openModal();
  }

  onShipmentInfoSubmit(createIntDocDto: CreateInternetDocumentDto) {
    this.isLoading = true;
    this.orderService.createInternetDocument(this.order.id, createIntDocDto)
      .pipe(
        this.notyService.attachNoty({ successText: `Накладная успешно создана` }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        response => {
          this.order = response.data;
        }
      );
  }

  onTrackingIdSubmit(trackingId: string) {
    this.isLoading = true;
    this.orderService.createInternetDocumentByTrackingId(this.order.id, trackingId)
      .pipe(
        this.notyService.attachNoty({ successText: `Накладная успешно добавлена` }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        response => {
          this.order = response.data;
        }
      );
  }

  updateShipmentStatus() {
    this.isLoading = true;
    this.orderService.updateShipmentStatus(this.order.id)
      .pipe(
        this.notyService.attachNoty({ successText: 'Статус отправки обновлён' }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        response => {
          this.order = response.data;
        }
      );
  }

  finishOrder() {
    if (!confirm(`Заказ должен автоматически перейти в статус "Завершён". Вы уверены, что хотите сделать это вручную?`)) { return; }

    this.changeStatus(OrderStatusEnum.FINISHED);
  }

  changeStatus(nextStatus: OrderStatusEnum, shipment?: ShipmentDto) {
    this.isLoading = true;
    this.orderService.changeStatus(this.order.id, nextStatus, shipment)
      .pipe(
        this.notyService.attachNoty({ successText: `Статус заказа успешно изменён` }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        response => {
          this.order = response.data;
        }
      );
  }

  isPaymentToggleVisible() {
    return !this.isCashOnDelivery();
  }

  isCashOnDelivery() {
    return this.order.paymentInfo.type === PaymentMethodEnum.CASH_ON_DELIVERY;
  }

  getItemThumbnail(item: OrderItemDto): string {
    if (!item.imageUrl) {
      return 'admin/assets/images/no-img.png';
    } else {
      return UPLOADED_HOST + item.imageUrl;
    }
  }

  private handlePaymentStatusControl() {
    this.paymentStatusControl = new FormControl(this.order.isOrderPaid);
    this.paymentStatusControl.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap(_ => {
          this.isLoading = true;
          this.paymentStatusError = null;
        }),
        switchMap(isPaid => this.orderService.changePaymentStatus(this.order.id, isPaid)),
        this.notyService.attachNoty({ successText: `Заказ успешно обновлён` }),
        catchError((err, caught) => {
          this.isLoading = false;
          this.paymentStatusError = err.error?.message || DEFAULT_ERROR_TEXT;
          console.error(err);
          return caught;
        })
      )
      .subscribe(response => {
        this.isLoading = false;
        this.order = response.data;
      });
  }

  public copyOrderIdToClipboard(id: number) {
    this.copyToClipboard(`Заказ № ${id}`);
  }

  public togglePdfTooltip() {
    this.isPdfButtonsVisible = !this.isPdfButtonsVisible;
  }

  openInvoicePopup() {
    this.invoiceModalCmp.openModal();
  }

  onPackOrderItemClick(item: OrderItemDto): void {
    if (item.qty === 1) {
      this.packOrderItem(item, item.qty);
    } else {
      this.confirmPackCmp.openModal(item.name[this.lang]).subscribe(qty => {
        if (qty) {
          this.packOrderItem(item, qty);
        }
      });
    }
  }

  private packOrderItem(item: OrderItemDto, qty: number) {
    this.isLoading = true;
    this.orderService.packOrderItem(this.order.id, item, qty)
      .pipe(
        this.notyService.attachNoty({ successText: `Товар "${item.name[this.lang]}" успешно упакован` }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        response => {
          this.order = response.data;
        }
      );
  }

  canCreateInternetDocument(): boolean {
    return this.order.medias.length > 0 || this.order.items.every(item => item.isPacked);
  }

  copyToClipboard(text: any): void {
    copyToClipboard(text);
    this.notyService.showSuccessNoty(`Скопировано "${text}"`);
  }

  onRecipientContactInfoSubmit(contactInfo: ContactInfoDto) {
    this.isLoading = true;
    this.orderService.updateRecipientContactInfo(this.order.id, contactInfo)
      .pipe(
        this.notyService.attachNoty({ successText: 'Получатель успешно обновлён' }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        response => {
          this.order = response.data;
          this.contactInfoModalCmp.closeModal();
        }
      );
  }

  getMediaUploadUrl() {
    return `${API_HOST}/api/v1/admin/orders/${this.order?.id}/media`;
  }

  onMediaUploaded($event: ResponseDto<OrderDto>) {
    this.order.medias = $event.data.medias;
    this.order.logs = $event.data.logs;
  }

  createReceipt() {
    // if (!confirm(`Чек будет отправлен в налоговую и клиенту на почту. Продолжить?`)) {
    if (!confirm(`Чек будет тестовый и отправлен на info@klondike.com.ua и больше никому. Продолжить?`)) {
      return;
    }

    this.isLoading = true;
    this.taxService.createReceipt(this.order.id)
      .pipe(
        this.notyService.attachNoty({ successText: 'Чек создан и отправлен' }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        response => {
          this.order.receiptId = response.data.id;
        }
      );
  }

  viewReceipt() {
    this.isLoading = true;
    this.taxService.getReceiptRepresentationUrl(this.order.receiptId, TaxReceiptRepresentationType.Pdf)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        response => {
          window.open(response.data, '_blank');
        }
      );
  }

  onOrderItemsChanged(evt: { items: OrderItemDto[]; prices: OrderPricesDto }) {
    this.order.items = evt.items;
    this.order.prices = evt.prices;
  }
}
