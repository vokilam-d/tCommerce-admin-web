import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetBreadcrumbsComponent } from './set-breadcrumbs.component';

describe('SetBreadcrumbsComponent', () => {
  let component: SetBreadcrumbsComponent;
  let fixture: ComponentFixture<SetBreadcrumbsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetBreadcrumbsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetBreadcrumbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
