import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddImpactStoryDialogComponent } from './add-impact-story-dialog.component';

describe('AddImpactStoryDialogComponent', () => {
  let component: AddImpactStoryDialogComponent;
  let fixture: ComponentFixture<AddImpactStoryDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddImpactStoryDialogComponent]
    });
    fixture = TestBed.createComponent(AddImpactStoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
