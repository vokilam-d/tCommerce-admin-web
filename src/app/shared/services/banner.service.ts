import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { IBannerItem } from '../../pages/banner/banner-item.interface';
import { HttpClient } from '@angular/common/http';
import { ResponseDto } from '../dtos/response.dto';
import { BannerItemDto } from '../dtos/banner-item.dto';
import { API_HOST } from '../constants/constants';
import { CreateBannerItemDto } from '../dtos/create-banner-item.dto';
import { UpdateBannerDto } from '../dtos/update-banner.dto';


@Injectable({
  providedIn: 'root'
})
export class BannerService {

  constructor(private http: HttpClient) { }

  fetchBanner(): Observable<ResponseDto<BannerItemDto[]>> {
    return this.http.get<ResponseDto<BannerItemDto[]>>(`${API_HOST}/api/v1/admin/banner`);
  }

  createBannerItem(dto: CreateBannerItemDto): Observable<ResponseDto<BannerItemDto>> {
    return this.http.post<ResponseDto<BannerItemDto>>(`${API_HOST}/api/v1/admin/banner/banner-item`, dto);
  }

  updateBanner(dto: UpdateBannerDto): Observable<ResponseDto<BannerItemDto[]>> {
    return this.http.post<ResponseDto<BannerItemDto[]>>(`${API_HOST}/api/v1/admin/banner`, dto);
  }
}
