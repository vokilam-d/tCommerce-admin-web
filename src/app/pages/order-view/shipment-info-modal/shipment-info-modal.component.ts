import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ShipmentDto } from '../../../shared/dtos/shipment.dto';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ShipmentSenderService } from '../../../shared/services/shipment-sender.service';
import { ISelectOption } from '../../../shared/components/select/select-option.interface';
import { ShipmentSenderDto } from '../../../shared/dtos/shipment-sender.dto';
import { ShipmentPayerEnum } from '../../../shared/enums/shipment-payer.enum';
import { NotyService } from '../../../noty/noty.service';
import { AddressTypeEnum } from '../../../shared/enums/address-type.enum';
import { CreateInternetDocumentDto } from '../../../shared/dtos/create-internet-document.dto';
import { ShipmentPaymentMethodEnum } from '../../../shared/enums/shipment-payment-method.enum';
import { NgUnsubscribe } from '../../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { startWith } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'shipment-info-modal',
  templateUrl: './shipment-info-modal.component.html',
  styleUrls: ['./shipment-info-modal.component.scss']
})
export class ShipmentInfoModalComponent extends NgUnsubscribe implements OnInit {

  isModalVisible: boolean = false;
  form: FormGroup;
  sendersSelectOptions: ISelectOption<number, ShipmentSenderDto>[];
  creationType: 'manual' | 'existing' = 'manual';
  trackingIdControl: FormControl = new FormControl('', Validators.required);
  private defaultSenderId: number;

  payerTypeOptions: ISelectOption[] = [{ view: 'Клиент', value: ShipmentPayerEnum.RECIPIENT }, { view: 'Мы', value: ShipmentPayerEnum.SENDER }];
  get payerTypeForCost(): ShipmentPayerEnum {
    const isToWarehouse = this.shipment.recipient.address.type === AddressTypeEnum.WAREHOUSE;
    return isToWarehouse && this.cost >= 1000 ? ShipmentPayerEnum.SENDER : ShipmentPayerEnum.RECIPIENT;
  }
  get payerTypeNameForCost(): string {
    return this.payerTypeOptions.find(o => o.value === this.payerTypeForCost).view;
  }

  paymentMethodOptions: ISelectOption[] = [
    { view: 'Нал', value: ShipmentPaymentMethodEnum.CASH },
    { view: 'Безнал', value: ShipmentPaymentMethodEnum.NON_CASH }
  ];

  @Input() shipment: ShipmentDto;
  @Input() cost: number;
  @Input() setBackwardDeliveryAsCost: boolean = false;
  @Output('infoSubmit') infoSubmitEmitter = new EventEmitter<CreateInternetDocumentDto>();
  @Output('trackingId') trackingIdEmitter = new EventEmitter<string>();

  constructor(
    private shipmentSenderService: ShipmentSenderService,
    private notyService: NotyService,
    private formBuilder: FormBuilder
  ) {
    super();
  }

  ngOnInit(): void {
    this.fetchSenders();
  }

  private fetchSenders() {
    this.shipmentSenderService.fetchAllSenders()
      .pipe()
      .subscribe(
        response => {
          this.setSenderSelectOptions(response.data);
          this.buildForm();
        }
      );
  }

  private buildForm() {
    let backwardMoneyDelivery: any = this.shipment.backwardMoneyDelivery;
    if (this.setBackwardDeliveryAsCost && !backwardMoneyDelivery) {
      backwardMoneyDelivery = this.cost;
    }

    let payerType: ShipmentPayerEnum = this.shipment.payerType;
    if (!payerType) {
      payerType = this.payerTypeForCost;
    }

    const controls: Omit<Record<keyof CreateInternetDocumentDto, any>, 'trackingNumber'> = {
      senderId: [this.defaultSenderId, Validators.required],
      weight: [this.shipment.weight, Validators.required],
      width: [this.shipment.width, Validators.required],
      height: [this.shipment.height, Validators.required],
      length: [this.shipment.length, Validators.required],
      description: [this.shipment.description, Validators.required],
      payerType: [payerType, Validators.required],
      paymentMethod: [payerType, Validators.required],
      backwardMoneyDelivery: backwardMoneyDelivery,
      cost: this.cost
    };

    this.form = this.formBuilder.group(controls);

    this.handlePaymentMethodValidation();
  }

  openModal() {
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
  }

  onFormSubmit() {
    if (this.form.invalid) {
      this.notyService.showErrorNoty(`Ошибка в форме`);
      return;
    }

    this.infoSubmitEmitter.emit(this.form.value);
    this.closeModal();
  }

  private setSenderSelectOptions(senders: ShipmentSenderDto[]) {
    this.sendersSelectOptions = senders.map(sender => {
      if (sender.isDefault) {
        this.defaultSenderId = sender.id;
      }

      let view = `${sender.firstName} ${sender.lastName}, ${sender.phone}, ${sender.address}`;
      if (sender.isFop) {
        view = `ФОП ${view}`;
      }
      return {
        value: sender.id,
        view,
        additionalData: sender
      };
    });
  }

  onTrackingIdSubmit() {
    const trackingId = this.trackingIdControl.value;
    if (!trackingId) {
      this.notyService.showErrorNoty(`Введите номер накладной`);
      return;
    }

    this.trackingIdEmitter.emit(trackingId);
    this.closeModal();
  }

  private handlePaymentMethodValidation() {
    const senderProp: keyof CreateInternetDocumentDto = 'senderId';
    const payerTypeProp: keyof CreateInternetDocumentDto = 'payerType';
    const paymentMethodProp: keyof CreateInternetDocumentDto = 'paymentMethod';

    const senderControl = this.form.get(senderProp);
    const payerTypeControl = this.form.get(payerTypeProp);
    const paymentMethodControl = this.form.get(paymentMethodProp);

    combineLatest([
      senderControl.valueChanges,
      payerTypeControl.valueChanges,
    ])
      .pipe(
        this.takeUntilDestroy(),
        startWith([senderControl.value, payerTypeControl.value])
      )
      .subscribe(values => {
        const senderId = values[0] as number;
        const payerType = values[1] as ShipmentPayerEnum;

        const sender = this.getSenderById(senderId);
        const paymentMethod = paymentMethodControl.value as ShipmentPaymentMethodEnum;

        if (sender.isFop && payerType === ShipmentPayerEnum.SENDER) {
          paymentMethodControl.setValue(ShipmentPaymentMethodEnum.NON_CASH);
        } else {
          if (paymentMethod === ShipmentPaymentMethodEnum.NON_CASH && paymentMethodControl.touched) {
            this.notyService.showErrorNoty(`Безнал не может быть выбран, если отправитель не ФОП, и плательщик не Мы`);
          }

          paymentMethodControl.setValue(ShipmentPaymentMethodEnum.CASH);
        }
      });

    paymentMethodControl.valueChanges
      .pipe( this.takeUntilDestroy() )
      .subscribe((paymentMethod: ShipmentPaymentMethodEnum) => {
        const sender = this.getSenderById(senderControl.value);
        const payerType = payerTypeControl.value as ShipmentPayerEnum;

        if (paymentMethod === ShipmentPaymentMethodEnum.NON_CASH) {
          let error: string = null;
          if (!sender.isFop) {
            error = `Безнал не может быть выбран, если отправитель не ФОП`;
          }
          if (payerType !== ShipmentPayerEnum.SENDER) {
            error = `Безнал не может быть выбран, если плательщик не Мы`;
          }

          if (error) {
            this.notyService.showErrorNoty(error);
            paymentMethodControl.setValue(ShipmentPaymentMethodEnum.CASH, { emitEvent: false });
          }
        }
      });
  }

  private getSenderById(senderId: number): ShipmentSenderDto {
    return this.sendersSelectOptions.find(option => option.value === senderId).additionalData;
  }
}
