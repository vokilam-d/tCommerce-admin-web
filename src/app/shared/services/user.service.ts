import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseDto } from '../dtos/response.dto';
import { API_HOST } from '../constants/constants';
import { AddOrUpdateUserDto, UserDto } from '../dtos/user.dto';
import { tap } from 'rxjs/operators';
import { LoginDto } from '../dtos/login.dto';
import { REQUEST } from '@nguniversal/express-engine/tokens';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  user: UserDto;

  constructor(
    private http: HttpClient,
    @Optional() @Inject(REQUEST) private req: any
  ) { }

  login(loginDto: LoginDto) {
    return this.http.post<ResponseDto<UserDto>>(`${API_HOST}/api/v1/admin/user/login`, loginDto)
      .pipe( tap(response => this.user = response.data) );
  }

  logout() {
    return this.http.post<ResponseDto<any>>(`${API_HOST}/api/v1/admin/user/logout`, { })
      .pipe( tap(_ => this.user = null) );
  }

  fetchUser() {
    return this.http.get<ResponseDto<UserDto>>(`${API_HOST}/api/v1/admin/user`)
      .pipe( tap(response => this.user = response.data) );
  }

  fetchAllUsers() {
    return this.http.get<ResponseDto<UserDto[]>>(`${API_HOST}/api/v1/admin/user/list`);
  }

  createUser(userDto: AddOrUpdateUserDto) {
    return this.http.post<ResponseDto<UserDto>>(`${API_HOST}/api/v1/admin/user`, userDto);
  }

  updateUser(userId: string, userDto: AddOrUpdateUserDto) {
    return this.http.put<ResponseDto<UserDto>>(`${API_HOST}/api/v1/admin/user/${userId}`, userDto);
  }

  deleteUser(userId: string) {
    return this.http.delete<ResponseDto<UserDto>>(`${API_HOST}/api/v1/admin/user/${userId}`);
  }
}
