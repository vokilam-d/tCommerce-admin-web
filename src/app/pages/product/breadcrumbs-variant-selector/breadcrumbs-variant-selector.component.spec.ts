import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadcrumbsVariantSelectorComponent } from './breadcrumbs-variant-selector.component';

describe('BreadcrumbsVariantSelectorComponent', () => {
  let component: BreadcrumbsVariantSelectorComponent;
  let fixture: ComponentFixture<BreadcrumbsVariantSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BreadcrumbsVariantSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadcrumbsVariantSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
