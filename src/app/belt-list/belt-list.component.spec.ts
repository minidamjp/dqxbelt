import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeltListComponent } from './belt-list.component';

describe('BeltListComponent', () => {
  let component: BeltListComponent;
  let fixture: ComponentFixture<BeltListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeltListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BeltListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
