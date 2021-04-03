import { TestBed } from '@angular/core/testing';

import { BeltDataService } from './belt-data.service';

describe('BeltDataService', () => {
  let service: BeltDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BeltDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
