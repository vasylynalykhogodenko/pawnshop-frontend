import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-client-add',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    RouterModule,
  ],
  templateUrl: './client-add.component.html',
  styleUrls: ['./client-add.component.css']
})
export class ClientAddComponent {
  clientForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private authService: AuthService,
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

  cancelAdd(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onSubmit() {
    if (this.clientForm.valid) {
      const token = this.authService.getToken();
      console.log('Submitting form with token:', token ? 'Token exists' : 'No token');

      if (!token) {
        this.snackBar.open('Authentication required', 'Close', {
          duration: 3000
        });
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

      console.log('Sending client data:', formData);

      this.http.post('http://localhost:5000/api/client', formData, { headers })
        .pipe(
          catchError(error => {
            console.error('Error creating client:', error);
            if (error.status === 403) {
              this.snackBar.open('Not authorized to create clients. Please check your permissions.', 'Close', {
                duration: 5000
              });
              if (!this.authService.isAuthenticated()) {
                this.router.navigate(['/login']);
              }
            } else {
              this.snackBar.open(
                `Error creating client: ${error.error?.message || 'Unknown error'}`, 
                'Close', 
                { duration: 5000 }
              );
            }
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response) => {
            console.log('Client created successfully:', response);
            this.snackBar.open('Client added successfully', 'Close', {
              duration: 3000
            });
            this.router.navigate(['../'], { relativeTo: this.route });
          }
        });
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000
      });
    }
  }
}