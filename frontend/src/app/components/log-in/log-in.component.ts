import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar'; 
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css',
})
export class LogInComponent {
  logInForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.logInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLogIn() {
    if (this.logInForm.valid) {
      const { email, password } = this.logInForm.value;
      this.authService.logIn({ email, password }).subscribe({
        next: (response) => {
          this.authService.tokenReady.pipe(
            filter(ready => ready),
            take(1)
          ).subscribe(() => {
            this.snackBar.open(`Welcome back, ${response.user.username}!`, 'Close', {
              duration: 5000,
            });
            console.log('Log In Successful', response);
            this.router.navigate(['/client']);
          });
        },
        error: (err) => {
          console.error('Log In Failed', err);
          this.snackBar.open('Login failed. Please check your credentials.', 'Close', {
            duration: 5000,
          });
        },
      });
    }
  }
}
