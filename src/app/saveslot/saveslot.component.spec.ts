import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveslotComponent } from './saveslot.component';

describe('SaveslotComponent', () => {
  let component: SaveslotComponent;
  let fixture: ComponentFixture<SaveslotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveslotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveslotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
