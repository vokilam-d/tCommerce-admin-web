import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from '../constants/constants';
import { ResponseDto } from '../dtos/response.dto';
import { TaxReceiptDto } from '../dtos/tax/tax-receipt.dto';
import { TaxReceiptRepresentationType } from '../enums/tax/tax-receipt-representation-type.enum';
import { TaxShiftDto } from '../dtos/tax/tax-shift.dto';

@Injectable({
  providedIn: 'root'
})
export class TaxService {

  constructor(
    private http: HttpClient
  ) { }

  getCurrentShift() {
    return this.http.get<ResponseDto<TaxShiftDto | null>>(`${API_HOST}/api/v1/admin/tax/shifts/current`)
  }

  openShift() {
    return this.http.post<ResponseDto<TaxShiftDto>>(`${API_HOST}/api/v1/admin/tax/shifts`, {})
  }

  closeShift() {
    return this.http.post<ResponseDto<TaxShiftDto>>(`${API_HOST}/api/v1/admin/tax/shifts/close`, {})
  }

  createReceipt(id: number) {
    return this.http.post<ResponseDto<TaxReceiptDto>>(`${API_HOST}/api/v1/admin/tax/receipts/orders/${id}`, {});
  }

  getReceiptRepresentationUrl(receiptId: string, type: TaxReceiptRepresentationType) {
    return this.http.get<ResponseDto<string>>(`${API_HOST}/api/v1/admin/tax/receipts/${receiptId}/representation-url/${type}`);
  }
}
