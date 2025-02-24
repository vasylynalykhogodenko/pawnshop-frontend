import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { Observable, of, firstValueFrom } from 'rxjs';
import { Client } from '../../../models/client.model';
import { ItemCategory } from '../../../models/item-category.model';
import { PawnTransaction } from '../../../models/pawn-transaction.model';

@Component({
  selector: 'app-pawn-transaction-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './pawn-transaction-edit.component.html',
  styleUrls: ['./pawn-transaction-edit.component.css']
})
export class PawnTransactionEditComponent implements OnInit {
  transactionForm: FormGroup;
  clients: Client[] = [];
  itemCategories: ItemCategory[] = [];
  isLoading = true;
  transactionId!: string;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.transactionForm = this.fb.group({
      itemCategory: ['', Validators.required],
      client: ['', Validators.required],
      itemDescription: ['', Validators.required],
      pawnDate: ['', Validators.required],
      returnDate: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      commission: [5, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  async ngOnInit() {
    try {
      await Promise.all([
        this.loadClients(),
        this.loadItemCategories()
      ]);

      this.route.params.pipe(
        switchMap((params: Params): Observable<PawnTransaction | null> => {
          if (!params['id']) {
            this.snackBar.open('Transaction ID not provided', 'Close', { duration: 3000 });
            this.router.navigate(['../../'], { relativeTo: this.route });
            return of(null);
          }
          this.transactionId = params['id'];
          return this.loadTransaction(this.transactionId);
        })
      ).subscribe({
        next: (transaction) => {
          if (transaction) {
            this.patchFormWithTransaction(transaction);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error in transaction chain:', error);
          this.isLoading = false;
          this.snackBar.open('Error loading transaction data', 'Close', { duration: 3000 });
        }
      });
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.isLoading = false;
      this.snackBar.open('Error loading initial data', 'Close', { duration: 3000 });
    }
  }

  private async loadClients(): Promise<void> {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    try {
      const response = await firstValueFrom(
        this.http.get<Client[]>('http://localhost:5000/api/client', { headers })
      );
      this.clients = response || [];
    } catch (error) {
      console.error('Error loading clients:', error);
      this.snackBar.open('Error loading clients', 'Close', { duration: 3000 });
      this.clients = [];
    }
  }

  private patchFormWithTransaction(transaction: PawnTransaction): void {
    this.transactionForm.patchValue({
      itemCategory: transaction.itemCategory._id,
      client: transaction.client._id,
      itemDescription: transaction.itemDescription,
      pawnDate: new Date(transaction.pawnDate),
      returnDate: new Date(transaction.returnDate),
      amount: transaction.amount,
      commission: transaction.commission
    });
  }

  private loadTransaction(id: string): Observable<PawnTransaction | null> {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return of(null);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<PawnTransaction>(`http://localhost:5000/api/pawnTransaction/${id}`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error loading transaction:', error);
          this.snackBar.open('Error loading transaction', 'Close', { duration: 3000 });
          this.router.navigate(['../../'], { relativeTo: this.route });
          return of(null);
        })
      );
  }

  private async loadItemCategories(): Promise<void> {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    try {
      const response = await firstValueFrom(
        this.http.get<ItemCategory[]>('http://localhost:5000/api/itemCategory', { headers }).pipe(
          catchError((error) => {
            console.error('Error loading item categories:', error);
            this.snackBar.open('Error loading item categories', 'Close', { duration: 3000 });
            return of([]);
          })
        )
      );
      this.itemCategories = response;
    } catch (error) {
      console.error('Error loading item categories:', error);
      this.snackBar.open('Error loading item categories', 'Close', { duration: 3000 });
      this.itemCategories = [];
    }
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      this.isLoading = true;
      const token = this.authService.getToken();
      if (!token) {
        this.snackBar.open('Authentication required', 'Close', { duration: 3000 });
        this.router.navigate(['/login']);
        return;
      }

      const headers = new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json');

      const formData = {
        ...this.transactionForm.value,
        pawnDate: this.formatDate(this.transactionForm.value.pawnDate),
        returnDate: this.formatDate(this.transactionForm.value.returnDate),
        priceHistory: [{
          price: this.transactionForm.value.amount,
          date: this.formatDate(new Date())
        }]
      };

      this.http.put(`http://localhost:5000/api/pawnTransaction/${this.transactionId}`, formData, { headers })
        .subscribe({
          next: () => {
            this.snackBar.open('Transaction updated successfully', 'Close', { duration: 3000 });
            this.router.navigate(['../../'], { relativeTo: this.route });
          },
          error: (error) => {
            console.error('Error updating transaction:', error);
            this.snackBar.open(
              `Error updating transaction: ${error.error?.message || 'Unknown error'}`,
              'Close',
              { duration: 5000 }
            );
            this.isLoading = false;
          }
        });
    } else {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
    }
  }

  onDelete() {
    const dialogRef = this.dialog.open(DeleteConfirmationDialog, {
      width: '250px',
      data: { title: 'Delete Transaction' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTransaction();
      }
    });
  }

  private deleteTransaction() {
    const token = this.authService.getToken();
    if (!token) {
      this.snackBar.open('Authentication required', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:5000/api/pawnTransaction/${this.transactionId}`, { headers })
      .subscribe({
        next: () => {
          this.snackBar.open('Transaction deleted successfully', 'Close', { duration: 3000 });
          this.router.navigate(['../../'], { relativeTo: this.route });
        },
        error: (error) => {
          console.error('Error deleting transaction:', error);
          this.snackBar.open(
            `Error deleting transaction: ${error.error?.message || 'Unknown error'}`,
            'Close',
            { duration: 5000 }
          );
        }
      });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  cancel(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}

@Component({
  selector: 'delete-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <div mat-dialog-content>
      Are you sure you want to delete this transaction?
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="false">No</button>
      <button mat-button [mat-dialog-close]="true" color="warn">Yes</button>
    </div>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class DeleteConfirmationDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string }) {}
}