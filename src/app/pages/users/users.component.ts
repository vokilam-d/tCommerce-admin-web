import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { NotyService } from '../../noty/noty.service';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { AddOrUpdateUserDto, UserDto } from '../../shared/dtos/user.dto';
import { CustomValidators } from '../../shared/classes/validators';
import { VALID_PASSWORD_REGEX } from '../../shared/constants/constants';
import { HeadService } from '../../shared/services/head.service';

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  users: UserDto[] = [];
  activeUser: UserDto;
  form: FormGroup;
  isLoading: boolean = false;

  get isNewUser(): boolean { return !this.activeUser?.id; }

  constructor(
    private userService: UserService,
    private notyService: NotyService,
    private router: Router,
    private headService: HeadService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.init();
  }

  private init() {
    this.activeUser = null;
    this.isLoading = true;
    this.userService.fetchAllUsers()
      .pipe( finalize(() => this.isLoading = false) )
      .subscribe(
        response => {
          this.users = response.data;

          if (this.users[0]) {
            this.selectUser(this.users[0]);
          }
        }
      );
  }

  selectUser(user: UserDto) {
    this.activeUser = user;

    const controls: Record<keyof Omit<AddOrUpdateUserDto, 'id'>, any> = {
      login: [user.login, Validators.required],
      password: ['', Validators.pattern(VALID_PASSWORD_REGEX)]
    };
    (controls as any).passwordConfirm = [''];
    if (!this.isNewUser) {
      (controls as any).oldPassword = [''];
    }

    this.form = this.formBuilder.group(controls);
    this.form.get('passwordConfirm').setValidators(CustomValidators.passwordConfirm(this.form.get('password')));

    this.headService.setTitle(this.activeUser?.login || `Новый пользователь`);
  }

  addNewUser() {
    const newUser = new UserDto();
    this.users.push(newUser);
    this.selectUser(newUser);
  }

  saveUser() {
    if (this.form.invalid) {
      this.notyService.showErrorNoty(`Ошибка в форме`);
      this.validateControls();
      return;
    }

    const dto: AddOrUpdateUserDto = {
      ...this.activeUser,
      ...this.form.value
    };

    if (this.isNewUser) {
      this.userService.createUser(dto)
        .pipe(this.notyService.attachNoty({ successText: `Юзер успешно создан` }))
        .subscribe(_ => this.init());
    } else {

      this.userService.updateUser(dto.id, dto)
        .pipe(this.notyService.attachNoty({ successText: `Юзер успешно обновлён` }))
        .subscribe(_ => this.init());
    }
  }

  deleteUser() {
    if (!this.activeUser.id || !confirm(`Вы уверены, что хотите удалить юзера '${this.activeUser.login}'?`)) {
      return;
    }

    this.userService.deleteUser(this.activeUser.id)
      .pipe(this.notyService.attachNoty({ successText: `Юзер успешно удалён` }))
      .subscribe(_ => this.init());
  }

  logout() {
    this.userService.logout()
      .subscribe(_ => this.router.navigate(['/', 'admin', 'login']));
  }

  private validateControls(form: FormGroup | FormArray = this.form) {
    Object.values(form.controls).forEach(control => {
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        this.validateControls(control);
      }
    });
  }

  isControlInvalid(control: AbstractControl): boolean {
    return !control.valid && control.touched;
  }
}
