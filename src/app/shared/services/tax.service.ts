import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from '../constants/constants';

@Injectable({
  providedIn: 'root'
})
export class TaxService {

  constructor(
    private http: HttpClient
  ) { }

  getShift() {
    return this.http.get(`${API_HOST}/api/v1/admin/tax/shift`)
  }
}
