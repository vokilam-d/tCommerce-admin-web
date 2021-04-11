import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseDto } from '../dtos/response.dto';
import { API_HOST } from '../constants/constants';
import { SettlementDto } from '../dtos/settlement.dto';
import { WarehouseDto } from '../dtos/warehouse.dto';
import { StreetDto } from '../dtos/street.dto';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  constructor(private http: HttpClient) {
  }

  fetchSettlements(query: string) {
    const params = {
      name: query,
      limit: '60'
    };
    return this.http.get<ResponseDto<SettlementDto[]>>(`${API_HOST}/api/v1/settlements`, { params: { name: query } });
  }

  fetchWarehouses(settlementId: string, query: string) {
    const params = {
      settlementId,
      filter: query,
      limit: '60'
    };

    return this.http.get<ResponseDto<WarehouseDto[]>>(`${API_HOST}/api/v1/warehouses`, { params });
  }

  fetchStreets(settlementId: string, query: string) {
    const params = {
      settlementId,
      filter: query,
      limit: '60'
    };

    return this.http.get<ResponseDto<StreetDto[]>>(`${API_HOST}/api/v1/streets`, { params });
  }
}
