import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerTypeModalComponent } from './banner-type-modal.component';

describe('BannerTypeModalComponent', () => {
  let component: BannerTypeModalComponent;
  let fixture: ComponentFixture<BannerTypeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BannerTypeModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BannerTypeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
