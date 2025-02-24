import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PawnTransactionAddComponent } from './pawn-transaction-add.component';

describe('PawnTransactionAddComponent', () => {
  let component: PawnTransactionAddComponent;
  let fixture: ComponentFixture<PawnTransactionAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PawnTransactionAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PawnTransactionAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
