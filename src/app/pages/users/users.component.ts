import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { NotyService } from '../../noty/noty.service';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { AddOrUpdateUserDto, UserDto } from '../../shared/dtos/user.dto';
import { CustomValidators } from '../../shared/classes/validators';
import { TRANSLATIONS_MAP } from '../../shared/constants/constants';
import { HeadService } from '../../shared/services/head.service';
import { ISelectOption } from '../../shared/components/select/select-option.interface';
import { Role } from '../../shared/enums/role.enum';

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
  rolesOptions: ISelectOption[] = [];

  get isNewUser(): boolean { return !this.activeUser?.id; }

  constructor(
    private userService: UserService,
    private notyService: NotyService,
    private router: Router,
    private headService: HeadService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setRolesOptions();
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
      password: ['', CustomValidators.password],
      name: user.name,
      role: user.role
    };
    (controls as any).passwordConfirm = [''];

    this.form = this.formBuilder.group(controls);

    const passwordKey: keyof AddOrUpdateUserDto = 'password';
    this.form.get('passwordConfirm').setValidators(CustomValidators.passwordConfirm(this.form.get(passwordKey)));

    this.headService.setTitle(this.activeUser?.login || `Новый пользователь`);
  }

  addNewUser() {
    const newUser = new UserDto();
    this.users.push(newUser);
    this.selectUser(newUser);
  }

  saveUser() {
    this.form.get('passwordConfirm').updateValueAndValidity();

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
        .pipe(this.notyService.attachNoty({ successText: `Пользователь успешно создан` }))
        .subscribe(_ => this.init());
    } else {

      this.userService.updateUser(this.activeUser.id, dto)
        .pipe(this.notyService.attachNoty({ successText: `Пользователь успешно обновлён` }))
        .subscribe(_ => this.init());
    }
  }

  deleteUser() {
    if (!this.activeUser.id || !confirm(`Вы уверены, что хотите удалить пользователя '${this.activeUser.login}'?`)) {
      return;
    }

    this.userService.deleteUser(this.activeUser.id)
      .pipe(this.notyService.attachNoty({ successText: `Пользователь успешно удалён` }))
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

  canEditRole(): boolean {
    return this.userService.user.role <= Role.Administrator;
  }

  getTranslation(role: Role): string {
    return TRANSLATIONS_MAP[role];
  }

  private setRolesOptions() {
    this.rolesOptions = Object.values(Role)
      .filter((role: Role) => role >= 0)
      .map((role: Role) => ({ view: this.getTranslation(role), value: role }));
  }
}
