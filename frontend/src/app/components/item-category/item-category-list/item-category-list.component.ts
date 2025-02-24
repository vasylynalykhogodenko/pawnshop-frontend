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
import { ItemCategory } from '../../../models/item-category.model';

@Component({
  selector: 'app-item-category-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './item-category-list.component.html',
  styleUrls: ['./item-category-list.component.css']
})
export class ItemCategoryListComponent implements OnInit {
  dataSource: MatTableDataSource<ItemCategory>;
  displayedColumns: string[] = ['name', 'actions'];
  isLoading = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.dataSource = new MatTableDataSource<ItemCategory>();
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get<ItemCategory[]>('http://localhost:5000/api/itemCategory', { headers })
      .subscribe({
        next: (categories) => {
          this.dataSource.data = categories;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.snackBar.open('Error loading categories', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  navigateToAdd(): void {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  navigateToEdit(id: string): void {
    if (!id) {
      console.error('No category ID provided');
      return;
    }
    this.router.navigate(['edit', id], { relativeTo: this.route });
  }
}