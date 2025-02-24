import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Client } from '../../../models/client.model';
import { ItemCategory } from '../../../models/item-category.model';

@Component({
  selector: 'app-pawn-transaction-add',
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
  ],
  templateUrl: './pawn-transaction-add.component.html',
  styleUrls: ['./pawn-transaction-add.component.css']
})
export class PawnTransactionAddComponent implements OnInit {
  transactionForm: FormGroup;
  clients: Client[] = [];
  itemCategories: ItemCategory[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.transactionForm = this.fb.group({
      itemCategory: ['', Validators.required],
      client: ['', Validators.required],
      itemDescription: ['', Validators.required],
      pawnDate: [new Date(), Validators.required],
      returnDate: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      commission: [5, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit() {
    this.loadClients();
    this.loadItemCategories();
  }

  private loadClients() {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get<Client[]>('http://localhost:5000/api/client', { headers })
      .subscribe({
        next: (clients) => {
          this.clients = clients;
        },
        error: (error) => {
          console.error('Error loading clients:', error);
          this.snackBar.open('Error loading clients', 'Close', { duration: 3000 });
        }
      });
  }

  private loadItemCategories() {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get<ItemCategory[]>('http://localhost:5000/api/itemCategory', { headers })
      .subscribe({
        next: (categories) => {
          this.itemCategories = categories;
        },
        error: (error) => {
          console.error('Error loading item categories:', error);
          this.snackBar.open('Error loading item categories', 'Close', { duration: 3000 });
        }
      });
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

      this.http.post('http://localhost:5000/api/pawnTransaction', formData, { headers })
        .subscribe({
          next: () => {
            this.snackBar.open('Transaction created successfully', 'Close', { duration: 3000 });
            this.router.navigate(['../'], { relativeTo: this.route });
          },
          error: (error) => {
            console.error('Error creating transaction:', error);
            this.snackBar.open(
              `Error creating transaction: ${error.error?.message || 'Unknown error'}`,
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

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  cancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}