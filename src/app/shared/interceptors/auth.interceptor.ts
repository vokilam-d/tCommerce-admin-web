import { Inject, Injectable, Optional } from '@angular/core';
import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { Request } from 'express';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    @Optional() @Inject(REQUEST) private serverReq: Request,
    private userService: UserService
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    const headers = this.getHeaders(request.headers);
    const cloned = request.clone({ headers });

    return next.handle(cloned)
      .pipe(
        catchError(err => {
          const isUnauthorized = err.error?.statusCode === 401 || err.status === 401;
          if (isUnauthorized) {
            this.router.navigate(['/', 'admin', 'login']);
            this.userService.user = null;

            return of(err);
          }

          throw err;
        })
      );
  }

  private getHeaders(headers: HttpHeaders) {
    if (!this.serverReq) { return headers; }
    const cookieStr = this.serverReq.get('cookie');
    if (!cookieStr) { return headers; }

    return headers.set('cookie', cookieStr);
  }
}
