import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private authService: AuthService) {}

  isLoggedIn(): boolean {
    return !!this.authService.getCurrentUser();
  }

  onSignOut() {
    this.authService.logout();
  }
}