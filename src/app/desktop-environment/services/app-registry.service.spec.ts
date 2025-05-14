import { TestBed } from '@angular/core/testing';

import { AppRegistryService } from './app-registry.service';

describe('AppRegistryService', () => {
  let service: AppRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
