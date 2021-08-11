import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPricesModalComponent } from './order-prices-modal.component';

describe('OrderPricesModalComponent', () => {
  let component: OrderPricesModalComponent;
  let fixture: ComponentFixture<OrderPricesModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderPricesModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderPricesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
