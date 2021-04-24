import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipientContactInfoComponent } from './recipient-contact-info.component';

describe('RecipientContactInfoComponent', () => {
  let component: RecipientContactInfoComponent;
  let fixture: ComponentFixture<RecipientContactInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecipientContactInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipientContactInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
