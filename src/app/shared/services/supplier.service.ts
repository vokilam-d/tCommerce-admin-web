import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IPagination } from '../../pagination/pagination.interface';
import { Observable } from 'rxjs';
import { ResponseDto } from '../dtos/response.dto';
import { SupplierDto } from '../dtos/supplier.dto';
import { toHttpParams } from '../helpers/to-http-params.function';
import { API_HOST } from '../constants/constants';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  constructor(
    private http: HttpClient
  ) { }

  fetchAllSuppliers(filter: IPagination): Observable<ResponseDto<SupplierDto[]>> {
    return this.http.get<ResponseDto<SupplierDto[]>>(
      `${API_HOST}/api/v1/admin/supplier`,
      { params: toHttpParams(filter) }
    );
  }

  fetchSupplier(id: number | string): Observable<ResponseDto<SupplierDto>> {
    return this.http.get<ResponseDto<SupplierDto>>(`${API_HOST}/api/v1/admin/supplier/${id}`);
  }

  addNewSupplier(dto: SupplierDto): Observable<ResponseDto<SupplierDto>> {
    return this.http.post<ResponseDto<SupplierDto>>(`${API_HOST}/api/v1/admin/supplier`, dto);
  }

  updateSupplier(id: number, dto: SupplierDto): Observable<ResponseDto<SupplierDto>> {
    return this.http.put<ResponseDto<SupplierDto>>(`${API_HOST}/api/v1/admin/supplier/${id}`, dto);
  }

  deleteSupplier(id: number) {
    return this.http.delete<ResponseDto<SupplierDto>>(`${API_HOST}/api/v1/admin/supplier/${id}`);
  }
}
