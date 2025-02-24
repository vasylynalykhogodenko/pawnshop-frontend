import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-item-category-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './item-category-add.component.html',
  styleUrls: ['./item-category-add.component.css']
})
export class ItemCategoryAddComponent {
  categoryForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.categoryForm = this.fb.group({
      categoryName: ['', [Validators.required, Validators.minLength(2)]],
      notes: [''],
    });
  }

  onSubmit() {
    if (this.categoryForm.valid) {
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

      const payload = {
        categoryName: this.categoryForm.get('categoryName')?.value.trim(),
        notes: this.categoryForm.get('notes')?.value.trim()
      };

      console.log('Sending category data:', payload);

      this.http.post('http://localhost:5000/api/itemCategory', payload, { headers })
        .subscribe({
          next: (response) => {
            console.log('Category created:', response);
            this.snackBar.open('Category created successfully', 'Close', { duration: 3000 });
            this.router.navigate(['../'], { relativeTo: this.route });
          },
          error: (error) => {
            console.error('Error creating category:', error);
            this.snackBar.open(
              `Error creating category: ${error.error?.message || 'Unknown error'}`,
              'Close',
              { duration: 5000 }
            );
            this.isLoading = false;
          }
        });
    }
  }

  cancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}