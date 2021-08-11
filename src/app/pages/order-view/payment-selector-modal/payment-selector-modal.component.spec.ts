import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSelectorModalComponent } from './payment-selector-modal.component';

describe('PaymentSelectorModalComponent', () => {
  let component: PaymentSelectorModalComponent;
  let fixture: ComponentFixture<PaymentSelectorModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentSelectorModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
