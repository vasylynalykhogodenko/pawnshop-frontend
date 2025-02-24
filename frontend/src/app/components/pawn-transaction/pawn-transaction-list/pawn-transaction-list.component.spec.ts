import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PawnTransactionListComponent } from './pawn-transaction-list.component';

describe('PawnTransactionListComponent', () => {
  let component: PawnTransactionListComponent;
  let fixture: ComponentFixture<PawnTransactionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PawnTransactionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PawnTransactionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
