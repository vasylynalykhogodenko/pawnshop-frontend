import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Client } from '../../../models/client.model';

interface DialogData {
  title: string;
}

@Component({
  selector: 'app-client-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    RouterModule,
  ],
  templateUrl: './client-edit.component.html',
  styleUrls: ['./client-edit.component.css']
})
export class ClientEditComponent implements OnInit {
  clientForm: FormGroup;
  clientId!: string;
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.clientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      middleName: [''],
      passportNumber: ['', Validators.required],
      passportSeries: ['', Validators.required],
      passportIssueDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.route.params.pipe(
      switchMap(params => {
        const id = params['id'];

        if (!id) {
          this.snackBar.open('Client ID not provided', 'Close', { duration: 3000 });
          this.router.navigate(['../../'], { relativeTo: this.route });
          return of(null);
        }

        this.clientId = id;
        return this.fetchClient(id);
      })
    ).subscribe({
      next: (client) => {
        if (client) {
          this.clientForm.patchValue({
            ...client,
            passportIssueDate: new Date(client.passportIssueDate)
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching client:', error);
        this.snackBar.open('Error loading client data', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  private fetchClient(id: string) {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return of(null);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Client>(`http://localhost:5000/api/client/${id}`, { headers });
  }

  onSubmit() {
    if (this.clientForm.valid) {
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
        ...this.clientForm.value,
        passportIssueDate: new Date(this.clientForm.value.passportIssueDate)
          .toISOString()
          .split('T')[0]
      };

      this.http.put(`http://localhost:5000/api/client/${this.clientId}`, formData, { headers })
        .pipe(
          catchError(error => {
            console.error('Error updating client:', error);
            this.snackBar.open(
              `Error updating client: ${error.error?.message || 'Unknown error'}`,
              'Close',
              { duration: 5000 }
            );
            return throwError(() => error);
          })
        )
        .subscribe({
          next: () => {
            this.snackBar.open('Client updated successfully', 'Close', { duration: 3000 });
            this.router.navigate(['../../'], { relativeTo: this.route });
          }
        });
    }
  }

  onDelete() {
    const dialogRef = this.dialog.open(DeleteConfirmationDialog, {
      width: '250px',
      data: { title: 'Delete Client' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const token = this.authService.getToken();
        if (!token) {
          this.snackBar.open('Authentication required', 'Close', { duration: 3000 });
          this.router.navigate(['/login']);
          return;
        }

        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.delete(`http://localhost:5000/api/client/${this.clientId}`, { headers })
          .pipe(
            catchError(error => {
              console.error('Error deleting client:', error);
              this.snackBar.open(
                `Error deleting client: ${error.error?.message || 'Unknown error'}`,
                'Close',
                { duration: 5000 }
              );
              return throwError(() => error);
            })
          )
          .subscribe({
            next: () => {
              this.snackBar.open('Client deleted successfully', 'Close', { duration: 3000 });
              this.router.navigate(['../../'], { relativeTo: this.route });
            }
          });
      }
    });
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
      Are you sure you want to delete this client?
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
  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}
}