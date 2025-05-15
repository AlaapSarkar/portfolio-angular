import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextPadAppComponent } from './text-pad-app.component';

describe('TextPadAppComponent', () => {
  let component: TextPadAppComponent;
  let fixture: ComponentFixture<TextPadAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextPadAppComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextPadAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
