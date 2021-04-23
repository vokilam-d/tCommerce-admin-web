import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NotyService } from '../../../noty/noty.service';
import { OrderDto } from '../../../shared/dtos/order.dto';
import { InvoiceEditDto } from '../../../shared/dtos/invoice-edit.dto';
import { NgUnsubscribe } from '../../../shared/directives/ng-unsubscribe/ng-unsubscribe.directive';
import { AddressTypeEnum } from '../../../shared/enums/address-type.enum';

@Component({
  selector: 'invoice-modal',
  templateUrl: './invoice-modal.component.html',
  styleUrls: ['./invoice-modal.component.scss']
})
export class InvoiceModalComponent extends NgUnsubscribe implements OnInit {

  isModalVisible: boolean = false;
  form: FormGroup;
  activeTitleIndex: number = 0;
  titles: string[] = ['Видаткова накладна', 'Рахунок-фактура'];

  @Input() order: OrderDto;
  @Output('print') printEmitter = new EventEmitter<InvoiceEditDto>();

  get isShipmentToDoors(): boolean {
    return this.order.shipment.recipient.address.type === AddressTypeEnum.DOORS;
  }

  constructor(
    private notyService: NotyService,
    private formBuilder: FormBuilder
  ) {
    super();
  }

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm() {
    const controls: Partial<Record<keyof InvoiceEditDto, any>> = {
      title: this.titles[0],
      address: this.order.shipment.recipient.address.addressNameFull || this.order.shipment.recipient.address.addressName,
      addressCity: this.order.shipment.recipient.address.settlementNameFull || this.order.shipment.recipient.address.settlementName,
      addressName: `${this.order.shipment.recipient.contactInfo.firstName} ${this.order.shipment.recipient.contactInfo.lastName}`,
      addressPhone: this.order.shipment.recipient.contactInfo.phoneNumber,
      hideStamp: false,
      withoutDiscounts: false
    };

    if (this.isShipmentToDoors) {
      controls.addressBuildingNumber = this.order.shipment.recipient.address.buildingNumber;
      controls.addressFlatNumber = this.order.shipment.recipient.address.flat;
    }

    this.form = this.formBuilder.group(controls);
    this.form.get('title').valueChanges
      .pipe( this.takeUntilDestroy() )
      .subscribe((title: string) => {
        if (!this.titles.includes(title)) {
          this.activeTitleIndex = null;
        }
      });
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

    this.printEmitter.emit(this.form.value);
    this.closeModal();
  }

  selectTitle(index: number) {
    this.activeTitleIndex = index;
    this.form.get('title').setValue(this.titles[this.activeTitleIndex]);
  }
}
