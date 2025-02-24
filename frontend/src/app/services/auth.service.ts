import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  private tokenReadySubject = new BehaviorSubject<boolean>(false);
  private tokenValue: string | null = null;
  public currentUser = this.currentUserSubject.asObservable();
  public tokenReady = this.tokenReadySubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('currentUser');
      if (token && !this.isTokenExpired()) {
        this.tokenValue = token;
        this.tokenReadySubject.next(true);
        if (user) {
          this.currentUserSubject.next(JSON.parse(user));
        }
      } else {
        this.logout();
      }
    }
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return this.tokenValue;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in localStorage');
      return null;
    }
    
    try {
      const decodedToken: any = jwtDecode(token);
      const isExpired = new Date(decodedToken.exp * 1000) < new Date();
      
      if (isExpired) {
        console.log('Token is expired');
        this.logout();
        return null;
      }
      
      console.log('Valid token found');
      return token;
    } catch (error) {
      console.error('Error decoding token:', error);
      this.logout();
      return null;
    }
  }

  isTokenExpired(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return !this.tokenValue;
    }

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const expirationDate = new Date(decodedToken.exp * 1000);
        const isExpired = expirationDate < new Date();
        
        console.log('Auth Service - Token expiration check:', {
          isExpired,
          expiresIn: Math.round((expirationDate.getTime() - new Date().getTime()) / 1000),
        });
        
        return isExpired;
      } catch (error) {
        console.error('Auth Service - Token decode error:', error);
        return true;
      }
    }
    return true;
  }


  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return !!this.tokenValue;
    }

    const token = this.getToken();
    return token !== null && !this.isTokenExpired();
  }

  checkTokenExpiration(): void {
    if (this.isTokenExpired()) {
      console.error('Token is expired');
      this.logout();
    }
  }

  signIn(user: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signin`, user).pipe(
      tap((response: any) => {
        if (response && response.token && isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  logIn(user: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user).pipe(
      tap((response: any) => {
        if (response && response.token) {
          const tokenValue = response.token.startsWith('Bearer ') 
            ? response.token 
            : response.token;
          
          this.tokenValue = tokenValue;

          if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            localStorage.setItem('token', tokenValue);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
          }
          
          this.currentUserSubject.next(response.user);
          
          console.log('Auth Service - Token stored:', {
            token: tokenValue.substring(0, 20) + '...',
            user: response.user
          });
          
          setTimeout(() => {
            this.tokenReadySubject.next(true);
            console.log('Auth Service - Token ready state set to true');
          }, 50);
        }
      })
    );
  }

  getCurrentUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) {
      return this.currentUserSubject.value;
    }

    const user = this.currentUserSubject.value;

    if (!user) {
      const storedUser = localStorage.getItem('currentUser');

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          this.currentUserSubject.next(parsedUser);
          return parsedUser;
        } catch (error) {
          console.error('Error parsing stored user:', error);
          return null;
        }
      }
    }
    return user;
  }

  logout() {
    this.tokenValue = null;
    this.currentUserSubject.next(null);
    this.tokenReadySubject.next(false);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
    
    this.router.navigate(['/login']);
  }
}