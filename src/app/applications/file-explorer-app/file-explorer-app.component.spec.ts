import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileExplorerAppComponent } from './file-explorer-app.component';

describe('FileExplorerAppComponent', () => {
  let component: FileExplorerAppComponent;
  let fixture: ComponentFixture<FileExplorerAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileExplorerAppComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileExplorerAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
