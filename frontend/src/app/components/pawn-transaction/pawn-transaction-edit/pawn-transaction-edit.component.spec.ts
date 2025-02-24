import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PawnTransactionEditComponent } from './pawn-transaction-edit.component';

describe('PawnTransactionEditComponent', () => {
  let component: PawnTransactionEditComponent;
  let fixture: ComponentFixture<PawnTransactionEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PawnTransactionEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PawnTransactionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
