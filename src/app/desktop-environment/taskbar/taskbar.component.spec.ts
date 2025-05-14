import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DETaskbarComponent } from './taskbar.component';

describe('DETaskbarComponent', () => {
  let component: DETaskbarComponent;
  let fixture: ComponentFixture<DETaskbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DETaskbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DETaskbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
