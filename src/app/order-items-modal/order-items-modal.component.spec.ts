import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderItemsModalComponent } from './order-items-modal.component';

describe('OrderItemsModalComponent', () => {
  let component: OrderItemsModalComponent;
  let fixture: ComponentFixture<OrderItemsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderItemsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderItemsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
