import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseDto } from '../dtos/response.dto';
import { API_HOST } from '../constants/constants';
import { InventoryDto } from '../dtos/inventory.dto';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(
    private http: HttpClient
  ) {}

  fetchInventory(sku: string): Observable<ResponseDto<InventoryDto>> {
    return this.http.get<ResponseDto<InventoryDto>>(`${API_HOST}/api/v1/admin/inventories/${sku}`);
  }
}
