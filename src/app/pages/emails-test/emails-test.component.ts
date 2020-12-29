import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotyService } from '../../noty/noty.service';
import { API_HOST } from '../../shared/constants/constants';
import { HeadService } from '../../shared/services/head.service';

@Component({
  selector: 'emails-test',
  templateUrl: './emails-test.component.html',
  styleUrls: ['./emails-test.component.scss']
})
export class EmailsTestComponent implements OnInit {

  email: string = '';
  id: number = 1;
  private apiPrefix = 'admin/email-test';

  constructor(
    private http: HttpClient,
    private headService: HeadService,
    private notyService: NotyService
  ) { }

  ngOnInit() {
    this.headService.setTitle(`Письма`);
  }

  sendEmailConfirmationEmail() {
    if (!this.checkEmail()) { return; }

    const apiUrl = `${API_HOST}/api/v1/${this.apiPrefix}/email-confirmation`;
    this.http.post(apiUrl, { email: this.email })
      .pipe(this.notyService.attachNoty({ successText: 'Письмо успешно отправлено' }))
      .subscribe();
  }

  sendSuccessfulRegistrationEmail() {
    if (!this.checkEmail()) { return; }

    const apiUrl = `${API_HOST}/api/v1/${this.apiPrefix}/registration-success`;
    this.http.post(apiUrl, { email: this.email })
      .pipe(this.notyService.attachNoty({ successText: 'Письмо успешно отправлено' }))
      .subscribe();
  }

  sendOrderConfirmationEmail() {
    if (!this.checkEmail() || !this.id) { return; }

    const apiUrl = `${API_HOST}/api/v1/${this.apiPrefix}/order-confirmation/${this.id}`;
    this.http.post(apiUrl, { email: this.email })
      .pipe(this.notyService.attachNoty({ successText: 'Письмо успешно отправлено' }))
      .subscribe();
  }

  sendLeaveReviewEmail() {
    if (!this.checkEmail() || !this.id) { return; }

    const apiUrl = `${API_HOST}/api/v1/${this.apiPrefix}/leave-review/${this.id}`;
    this.http.post(apiUrl, { email: this.email })
      .pipe(this.notyService.attachNoty({ successText: 'Письмо успешно отправлено' }))
      .subscribe();
  }

  sendResetPasswordEmail() {
    if (!this.checkEmail()) { return; }

    const apiUrl = `${API_HOST}/api/v1/${this.apiPrefix}/reset-password`;
    this.http.post(apiUrl, { email: this.email })
      .pipe(this.notyService.attachNoty({ successText: 'Письмо успешно отправлено' }))
      .subscribe();
  }

  sendNewProductReviewEmail() {
    if (!this.checkEmail() || !this.id) { return; }

    const apiUrl = `${API_HOST}/api/v1/${this.apiPrefix}/new-product-review/${this.id}`;
    this.http.post(apiUrl, { email: this.email })
      .pipe(this.notyService.attachNoty({ successText: 'Письмо успешно отправлено' }))
      .subscribe();
  }

  sendNewStoreReviewEmail() {
    if (!this.checkEmail() || !this.id) { return; }

    const apiUrl = `${API_HOST}/api/v1/${this.apiPrefix}/new-store-review/${this.id}`;
    this.http.post(apiUrl, { email: this.email })
      .pipe(this.notyService.attachNoty({ successText: 'Письмо успешно отправлено' }))
      .subscribe();
  }

  private checkEmail(): boolean {
    if (this.email) {
      return true;
    } else {
      this.notyService.showErrorNoty(`Не указан email для тестирования`);
      return false;
    }
  }
}
