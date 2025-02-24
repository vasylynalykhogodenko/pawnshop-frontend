import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatTableModule,  MatTableDataSource } from '@angular/material/table';
import { DatePipe, CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Client } from '../../../models/client.model';
import { AuthService } from '../../../services/auth.service';
import { MatPaginator } from '@angular/material/paginator';
import { filter, take, catchError, delay, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [MatTableModule, DatePipe, CommonModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css',
})
export class ClientListComponent implements OnInit {
  dataSource: MatTableDataSource<Client>;
  displayedColumns: string[] = [
    'firstName',
    'lastName',
    'middleName',
    'passportNumber',
    'passportSeries',
    'passportIssueDate',
    'actions',
  ];
  isLoading = true;

  @ViewChild(MatPaginator) paginator: MatPaginator = null as unknown as MatPaginator;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.dataSource = new MatTableDataSource<Client>();
  }


  navigateToAddClient(): void {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  navigateToEdit(id: string): void {
    if (!id) {
      console.error('No client ID provided');
      return;
    }
    console.log('Navigating to edit client with ID:', id);
    this.router.navigate(['edit', id], { relativeTo: this.route });
  }

  ngOnInit(): void {
    console.log('Client List - Component initialized');
    
    this.authService.tokenReady.pipe(
      filter((ready: boolean) => {
        console.log('Client List - Token ready state:', ready);
        return ready;
      }),
      delay(100),
      take(1)
    ).subscribe({
      next: () => {
        if (this.authService.isAuthenticated()) {
          console.log('Client List - Token is valid, fetching clients');
          this.fetchClients();
        } else {
          console.warn('Client List - Token not valid');
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        console.error('Client List - Token ready subscription error:', err);
        this.router.navigate(['/login']);
      }
    });
  }

  fetchClients(): void {
    const token = this.authService.getToken();
    console.log('Client List - Starting client fetch, token present:', !!token);

    this.http.get<Client[]>('http://localhost:5000/api/client')
      .pipe(
        retry(1),
        catchError((error: HttpErrorResponse) => {
          console.error('Client List - Fetch error:', {
            status: error.status,
            message: error.message,
            headers: error.headers.keys()
          });
          
          if (error.status === 401) {
            this.authService.logout();
          }
          
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (data: Client[]) => {
          console.log('Client List - Data fetched successfully:', {
            count: data.length
          });
          this.dataSource.data = data;

          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }
}