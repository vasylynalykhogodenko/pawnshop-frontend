import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ItemCategory } from '../../../models/item-category.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-item-category-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './item-category-edit.component.html',
  styleUrls: ['./item-category-edit.component.css']
})
export class ItemCategoryEditComponent implements OnInit {
  categoryForm: FormGroup;
  isLoading = true;
  categoryId!: string;
  currentDateTime: string;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.categoryForm = this.fb.group({
      categoryName: ['', [Validators.required, Validators.minLength(2)]],
      notes: ['']
    });

    this.currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      if (!params['id']) {
        this.snackBar.open('Category ID not provided', 'Close', { duration: 3000 });
        this.router.navigate(['../../'], { relativeTo: this.route });
        return;
      }
      this.categoryId = params['id'];
      this.loadCategory();
    });
  }

  private async loadCategory() {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    try {
      const category = await firstValueFrom(
        this.http.get<ItemCategory>(`http://localhost:5000/api/itemCategory/${this.categoryId}`, { headers })
      );
      
      this.categoryForm.patchValue({
        categoryName: category.categoryName,
        notes: category.notes
      });
      
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading category:', error);
      this.snackBar.open('Error loading category', 'Close', { duration: 3000 });
      this.router.navigate(['../../'], { relativeTo: this.route });
    }
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
        notes: this.categoryForm.get('notes')?.value.trim(),
        updatedAt: this.currentDateTime,
        updatedBy: this.authService.getCurrentUser()?._id
      };

      console.log('Updating category with payload:', payload);

      this.http.put(`http://localhost:5000/api/itemCategory/${this.categoryId}`, payload, { headers })
        .subscribe({
          next: () => {
            this.snackBar.open('Category updated successfully', 'Close', { duration: 3000 });
            this.router.navigate(['../../'], { relativeTo: this.route });
          },
          error: (error) => {
            console.error('Error updating category:', error);
            this.snackBar.open(
              `Error updating category: ${error.error?.message || 'Unknown error'}`,
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
    const dialogRef = this.dialog.open(DeleteCategoryDialog, {
      width: '250px',
      data: { title: 'Delete Category' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteCategory();
      }
    });
  }

  private deleteCategory() {
    const token = this.authService.getToken();
    if (!token) {
      this.snackBar.open('Authentication required', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:5000/api/itemCategory/${this.categoryId}`, { headers })
      .subscribe({
        next: () => {
          this.snackBar.open('Category deleted successfully', 'Close', { duration: 3000 });
          this.router.navigate(['../../'], { relativeTo: this.route });
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.snackBar.open(
            `Error deleting category: ${error.error?.message || 'Unknown error'}`,
            'Close',
            { duration: 5000 }
          );
        }
      });
  }

  cancel(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}

@Component({
  selector: 'delete-category-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <div mat-dialog-content>
      Are you sure you want to delete this category?
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="false">No</button>
      <button mat-button [mat-dialog-close]="true" color="warn">Yes</button>
    </div>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class DeleteCategoryDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string }) {}
}