import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeltAddComponent } from './belt-add.component';

describe('BeltAddComponent', () => {
  let component: BeltAddComponent;
  let fixture: ComponentFixture<BeltAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeltAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BeltAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
