import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { PawnTransaction } from '../../../models/pawn-transaction.model';

@Component({
  selector: 'app-pawn-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './pawn-transaction-list.component.html',
  styleUrls: ['./pawn-transaction-list.component.css']
})
export class PawnTransactionListComponent implements OnInit {
  dataSource: MatTableDataSource<PawnTransaction>;
  displayedColumns: string[] = [
    'client',
    'itemCategory',
    'itemDescription',
    'amount',
    'commission',
    'pawnDate',
    'returnDate',
    'actions'
  ];
  isLoading = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.dataSource = new MatTableDataSource<PawnTransaction>();
  }

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get<PawnTransaction[]>('http://localhost:5000/api/pawnTransaction', { headers })
      .subscribe({
        next: (transactions) => {
          this.dataSource.data = transactions;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading transactions:', error);
          this.snackBar.open('Error loading transactions', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  navigateToAdd(): void {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['edit', id], { relativeTo: this.route });
  }
}