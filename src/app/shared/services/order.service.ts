import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseDto } from '../dtos/response.dto';
import { OrderDto, UpdateOrderAdminManager, UpdateOrderAdminNote } from '../dtos/order.dto';
import { toHttpParams } from '../helpers/to-http-params.function';
import { OrderItemDto } from '../dtos/order-item.dto';
import { CreateOrderItemDto } from '../dtos/create-order-item.dto';
import { ShipmentAddressDto } from '../dtos/shipment-address.dto';
import { IGridValue } from '../../grid/grid.interface';
import { API_HOST } from '../constants/constants';
import { ShipmentDto } from '../dtos/shipment.dto';
import { OrderStatusEnum } from '../enums/order-status.enum';
import { CalculatePricesDto } from '../dtos/calculate-prices.dto';
import { OrderPricesDto } from '../dtos/order-prices.dto';
import { PackOrderItemDto } from '../dtos/pack-order-item.dto';
import { CreateInternetDocumentDto } from '../dtos/create-internet-document.dto';
import { AddOrderDto } from '../dtos/add-order.dto';
import { ContactInfoDto } from '../dtos/contact-info.dto';

interface IFetchOrderOptions {
  customerId?: number;
  productId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) {
  }

  fetchOrders(filter: IGridValue, { customerId, productId }: IFetchOrderOptions = { }): Observable<ResponseDto<OrderDto[]>> {
    const params = toHttpParams({
      ...filter,
      customerId,
      productId
    });

    return this.http.get<ResponseDto<OrderDto[]>>(
      `${API_HOST}/api/v1/admin/orders`,
      { params }
    );
  }

  fetchOrder(id: string | number): Observable<ResponseDto<OrderDto>> {
    return this.http.get<ResponseDto<OrderDto>>(`${API_HOST}/api/v1/admin/orders/${id}`);
  }

  addNewOrder(dto: AddOrderDto): Observable<ResponseDto<OrderDto>> {
    return this.http.post<ResponseDto<OrderDto>>(`${API_HOST}/api/v1/admin/orders`, dto);
  }

  deleteOrder(id: number) {
    return this.http.delete<ResponseDto<OrderDto>>(`${API_HOST}/api/v1/admin/orders/${id}`);
  }

  updateOrderAddress(id: number, address: ShipmentAddressDto) {
    return this.http.put<ResponseDto<OrderDto>>(`${API_HOST}/api/v1/admin/orders/${id}/recipient-address`, address);
  }

  updateRecipientContactInfo(id: number, contactInfo: ContactInfoDto) {
    return this.http.put<ResponseDto<OrderDto>>(`${API_HOST}/api/v1/admin/orders/${id}/recipient-contact-info`, contactInfo);
  }

  updateOrderTrackingId(id: number, trackingNumber: string) {
    const payload: Partial<ShipmentDto> = {
      trackingNumber
    };

    return this.http.put<ResponseDto<OrderDto>>(`${API_HOST}/api/v1/admin/orders/${id}/tracking-number`, payload);
  }

  updateOrderAdminNote(id: number, adminNote: string) {
    const payload: UpdateOrderAdminNote = {
      note: adminNote
    };

    return this.http.put<ResponseDto<OrderDto>>(`${API_HOST}/api/v1/admin/orders/${id}/note`, payload);
  }

  updateOrderManager(id: number, userId: string) {
    const payload: UpdateOrderAdminManager = {
      userId
    };

    return this.http.put<ResponseDto<OrderDto>>(`${API_HOST}/api/v1/admin/orders/${id}/manager`, payload);
  }

  updateOrderPrices(id: number, orderPrices: OrderPricesDto) {
    return this.http.put<ResponseDto<OrderDto>>(`${API_HOST}/api/v1/admin/orders/${id}/prices`, orderPrices);
  }

  createOrderItem(sku: string, qty: number, omitReserved: boolean) {
    const payload: CreateOrderItemDto = {
      sku,
      qty,
      omitReserved
    };

    return this.http.post<ResponseDto<OrderItemDto>>(`${API_HOST}/api/v1/admin/order-items`, payload);
  }

  calculateOrderPrices(items: OrderItemDto[], customerId: number) {
    const payload: CalculatePricesDto = {
      items,
      customerId
    }

    return this.http.post<ResponseDto<OrderPricesDto>>(`${API_HOST}/api/v1/admin/order-items/prices`, payload);
  }

  updateShipmentStatus(id: number) {
    return this.http.post<ResponseDto<OrderDto>>(`${API_HOST}/api/v1/admin/orders/${id}/actions/update-shipment-status`, {});
  }

  getPrintOrderUrl(id: number): string {
    return `${API_HOST}/api/v1/admin/orders/${id}/order-pdf`;
  }

  getPrintInvoiceUrl(id: number): string {
    return `${API_HOST}/api/v1/admin/orders/${id}/invoice-pdf`;
  }

  createInternetDocument(id: number, createIntDocDto: CreateInternetDocumentDto) {
    return this.http.post<ResponseDto<OrderDto>>(`${API_HOST}/api/v1/admin/orders/${id}/internet-document`, createIntDocDto);
  }

  createInternetDocumentByTrackingId(id: number, trackingId: string) {
    const createIntDocDto = { trackingNumber: trackingId } as CreateInternetDocumentDto;
    return this.createInternetDocument(id, createIntDocDto);
  }

  changeStatus(id: number, nextStatus: OrderStatusEnum, shipment?: ShipmentDto) {
    return this.http.put<ResponseDto<OrderDto>>(`${API_HOST}/api/v1/admin/orders/${id}/status/${nextStatus}`, shipment);
  }

  changePaymentStatus(id: number, isPaid: boolean) {
    return this.http.put<ResponseDto<OrderDto>>(`${API_HOST}/api/v1/admin/orders/${id}/is-paid/${isPaid}`, {});
  }

  packOrderItem(id: number, item: OrderItemDto, qty: number) {
    const dto: PackOrderItemDto = {
      sku: item.sku,
      qty
    };

    return this.http.put<ResponseDto<OrderDto>>(`${API_HOST}/api/v1/admin/orders/${id}/is-packed`, dto);
  }
}
