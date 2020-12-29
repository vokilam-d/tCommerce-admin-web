import { Component, ContentChildren, Input, OnInit, QueryList, TemplateRef } from '@angular/core';
import { NotyService } from '../../../noty/noty.service';


@Component({
  selector: 'tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit {

  activeLabelIdx: number = 0;

  @Input() labels: string[];
  @Input() isLoading: boolean = false;
  @ContentChildren('tabContent') tabContents: QueryList<TemplateRef<any>>;

  get tabContentsArray(): TemplateRef<any>[] { return this.tabContents.toArray(); }

  constructor(private notyService: NotyService) { }

  ngOnInit() {
    if (!this.labels) {
      this.notyService.showErrorNoty(`[${TabsComponent.name}]: Input property "labels" is mandatory`);
      throw new Error(`Input property 'labels' is mandatory`);
    }
  }
}
