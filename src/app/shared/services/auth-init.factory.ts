import { UserService } from './user.service';
import { Location } from '@angular/common';

export function authInitFactory(userService: UserService, location: Location) {
  return () => {
    if (location.path() === '/admin/login') {
      return true;
    } else {
      return userService.fetchUser().toPromise().catch(_ => { });
    }
  }
}
