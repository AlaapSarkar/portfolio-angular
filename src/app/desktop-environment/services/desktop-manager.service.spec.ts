import { TestBed } from '@angular/core/testing';

import { DesktopManagerService } from './desktop-manager.service';

describe('DesktopManagerService', () => {
  let service: DesktopManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DesktopManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
