import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AttributeDto, CreateAttributeDto, UpdateAttributeDto } from '../dtos/attribute.dto';
import { BehaviorSubject, Observable } from 'rxjs';
import { ResponseDto } from '../dtos/response.dto';
import { tap } from 'rxjs/operators';
import { IGridValue } from '../../grid/grid.interface';
import { toHttpParams } from '../helpers/to-http-params.function';
import { API_HOST, DEFAULT_LANG } from '../constants/constants';

@Injectable({
  providedIn: 'root'
})
export class AttributeService {

  private _attributes$: BehaviorSubject<AttributeDto[]> = new BehaviorSubject([]);
  attributes$ = this._attributes$.asObservable();

  constructor(private http: HttpClient) {
    this.setAttributes();
  }

  setAttributes() {
    const labelProp: keyof AttributeDto = 'label';

    this.http.get<ResponseDto<AttributeDto[]>>(
      `${API_HOST}/api/v1/admin/attributes`,
      { params: toHttpParams({ limit: 0, sort: labelProp }) }
    )
      .subscribe(
        response => {
          this._attributes$.next(response.data);
        }
      );
  }

  fetchAttributes(gridValue: IGridValue): Observable<ResponseDto<AttributeDto[]>> {
    return this.http.get<ResponseDto<AttributeDto[]>>(
      `${API_HOST}/api/v1/admin/attributes`,
      { params: toHttpParams(gridValue) }
    );
  }

  fetchAttribute(id: string): Observable<ResponseDto<AttributeDto>> {
    return this.http.get<ResponseDto<AttributeDto>>(`${API_HOST}/api/v1/admin/attributes/${id}`);
  }

  addNewAttribute(dto: CreateAttributeDto): Observable<ResponseDto<AttributeDto>> {
    return this.http.post<ResponseDto<AttributeDto>>(`${API_HOST}/api/v1/admin/attributes`, dto)
      .pipe( tap(() => this.setAttributes()) );
  }

  updateAttribute(id: string, dto: UpdateAttributeDto): Observable<ResponseDto<AttributeDto>> {
    return this.http.put<ResponseDto<AttributeDto>>(`${API_HOST}/api/v1/admin/attributes/${id}`, dto)
      .pipe( tap(() => this.setAttributes()) );
  }

  deleteAttribute(id: string) {
    return this.http.delete<any>(`${API_HOST}/api/v1/admin/attributes/${id}`)
      .pipe( tap(() => this.setAttributes()) );
  }

  getAttributeLabel(attrId: string): string {
    const found = this._attributes$.getValue().find(attr => attr.id === attrId);
    if (!found) {
      throw new Error(`Attribute with id '${attrId}' not found`);
    }

    return found.label[DEFAULT_LANG];
  }

  getValueLabel(attrId: string, valueIds: string[]): string {
    const found = this._attributes$.getValue().find(attr => attr.id === attrId);
    if (!found) { return '- - -'; }

    const foundValue = found.values.filter(value => valueIds.includes(value.id));
    if (!foundValue.length) { return '- - -'; }

    return foundValue.map(values => values.label[DEFAULT_LANG]).join(', ');
  }
}
