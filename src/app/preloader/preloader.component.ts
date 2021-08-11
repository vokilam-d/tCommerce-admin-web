import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'preloader',
  templateUrl: './preloader.component.html',
  styleUrls: ['./preloader.component.scss']
})
export class PreloaderComponent implements OnInit {

  @Input() hasOverlay: boolean = false;
  @Input() hasMargins: boolean = true;
  @Input() position: 'page-bottom' = null;

  constructor() { }

  ngOnInit() {
  }

}
