import { TestBed } from '@angular/core/testing';

import { NgxSmartLoadingService } from './ngx-smart-loading.service';

describe('NgxSmartLoadingService', () => {
  let service: NgxSmartLoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxSmartLoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
