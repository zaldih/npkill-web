import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultCardShelfComponent } from './result-card-shelf.component';

describe('ResultCardShelfComponent', () => {
  let component: ResultCardShelfComponent;
  let fixture: ComponentFixture<ResultCardShelfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultCardShelfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultCardShelfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
