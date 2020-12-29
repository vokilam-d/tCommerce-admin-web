import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseDto } from '../dtos/response.dto';
import { API_HOST } from '../constants/constants';
import { AnnouncementDto } from '../dtos/announcement.dto';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  constructor(private http: HttpClient) { }

  fetchAnnouncement(): Observable<ResponseDto<AnnouncementDto>> {
    return this.http.get<ResponseDto<AnnouncementDto>>(`${API_HOST}/api/v1/admin/announcement`);
  }

  updateAnnouncement(dto: AnnouncementDto): Observable<ResponseDto<AnnouncementDto>> {
    return this.http.put<ResponseDto<AnnouncementDto>>(`${API_HOST}/api/v1/admin/announcement`, dto);
  }
}
