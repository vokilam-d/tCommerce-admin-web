import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultilingualControlComponent } from './multilingual-control.component';

describe('MultilingualControlComponent', () => {
  let component: MultilingualControlComponent;
  let fixture: ComponentFixture<MultilingualControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultilingualControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultilingualControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
