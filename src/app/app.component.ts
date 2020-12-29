import { Component, OnInit } from '@angular/core';
import { UserService } from './shared/services/user.service';
import { HeadService } from './shared/services/head.service';
import { DeviceService } from './shared/services/device-detector/device.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private appVersion = '1.0';

  get isLoggedIn(): boolean { return this.userService.user !== null; };

  constructor(
    private userService: UserService,
    private headService: HeadService,
    private deviceService: DeviceService
  ) { }

  ngOnInit(): void {
    this.headService.setNoindex();

    if (this.deviceService.isPlatformServer()) {
      return;
    }
    const version = localStorage.getItem('version');
    if (version === this.appVersion) {
      return;
    }

    localStorage.clear();
    localStorage.setItem('version', this.appVersion);
  }
}
