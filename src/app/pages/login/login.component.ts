import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from '../../shared/services/user.service';
import { LoginDto } from '../../shared/dtos/login.dto';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HeadService } from '../../shared/services/head.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  isLoading: boolean = false;
  formError: string;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private headService: HeadService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.headService.setTitle(`Вход`);
  }

  submit() {
    if (this.form.invalid) { return; }

    const dto: LoginDto = this.form.value;
    this.isLoading = true;
    this.userService.login(dto)
      .pipe( finalize(() => this.isLoading = false) )
      .subscribe(
        _ => {
          this.router.navigate(['/']);
        },
        error => {
          this.formError = error.error?.message || JSON.stringify(error.error || error);
        }
      );
  }

  private buildForm() {
    const controlsConfig: LoginDto = {
      login: '',
      password: ''
    };

    this.form = this.formBuilder.group(controlsConfig);
  }
}
