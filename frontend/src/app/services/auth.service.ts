import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from '../config';

const API_URL = environment.apiUrl;

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'donor' | 'ngo_admin' | 'system_admin';
  phone?: string;
  address?: string;
  profilePicture?: string;
  bio?: string;
  createdAt?: string;
  ngoId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr && userStr !== 'undefined' && userStr !== 'null') {
      try {
        const user = JSON.parse(userStr);
        if (user && user._id) {
          this.currentUserSubject.next(user);
        } else {
          console.warn('[DEBUG] AuthService: User in storage is invalid, clearing.');
          this.clearStorage();
        }
      } catch (e) {
        console.error('[DEBUG] AuthService: Failed to parse user string, clearing.', e);
        this.clearStorage();
      }
    } else {
      if (token || userStr) {
        console.warn('[DEBUG] AuthService: Clearing incomplete/corrupted storage.');
        this.clearStorage();
      }
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${API_URL}/auth/register`, userData).pipe(
      tap((response: any) => {
        // We don't call setAuth here anymore to force login after verification
      }),
    );
  }

  registerAdmin(adminData: any): Observable<any> {
    return this.http.post(`${API_URL}/auth/register-admin`, adminData).pipe(
      tap((response: any) => {
        if (response.success && response.token && response.user) {
          this.setAuth(response.token, response.user);
        }
      }),
    );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${API_URL}/auth/login`, credentials).pipe(
      tap((response: any) => {
        if (response.success && response.token && response.user) {
          this.setAuth(response.token, response.user);
        } else {
          console.error('[DEBUG] AuthService: Login response missing token or user!');
        }
      }),
    );
  }

  updateProfile(profileData: Partial<User>): Observable<any> {
    // Intercept for Google Test User to allow demo editing
    const user = this.getUser();
    if (user && user._id === 'google_user_123') {
      return new Observable(observer => {
        setTimeout(() => {
          const updatedUser = { ...user, ...profileData };
          this.setAuth(this.getToken() || '', updatedUser);
          observer.next({ success: true, user: updatedUser });
          observer.complete();
        }, 500);
      });
    }

    return this.http.put(`${API_URL}/auth/profile`, profileData).pipe(
      tap((response: any) => {
        if (response.success && response.user) {
          const token = this.getToken();
          if (token) {
            this.setAuth(token, response.user);
          }
        }
      })
    );
  }

  uploadProfilePicture(file: File): Observable<any> {
    // Intercept for Google Test User to allow demo image upload
    const user = this.getUser();
    if (user && user._id === 'google_user_123') {
      return new Observable(observer => {
        const reader = new FileReader();
        reader.onload = () => {
          const updatedUser = { ...user, profilePicture: reader.result as string };
          this.setAuth(this.getToken() || '', updatedUser);
          observer.next({ success: true, user: updatedUser });
          observer.complete();
        };
        reader.readAsDataURL(file);
      });
    }

    const formData = new FormData();
    formData.append('profilePicture', file);
    return this.http.post(`${API_URL}/auth/upload-profile-picture`, formData).pipe(
      tap((response: any) => {
        if (response.success && response.user) {
          const token = this.getToken();
          if (token) {
            this.setAuth(token, response.user);
          }
        }
      })
    );
  }

  logout() {
    this.clearStorage();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private setAuth(token: string, user: User) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clearStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUser(): User | null {
    const user = this.currentUserSubject.value;
    if (!user) {
      // Emergency: if we have a token but no user, try to load from storage again
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        try {
          const parsed = JSON.parse(userStr);
          if (parsed && parsed._id) {
            this.currentUserSubject.next(parsed);
            return parsed;
          }
        } catch (e) { }
      }
    }
    return user;
  }

  getUserRole(): string | null {
    const user = this.getUser();
    return user ? user.role : null;
  }

  googleLogin(): Observable<any> {
    // Mock Google Login - simulating a successful OAuth callback
    return new Observable(observer => {
      setTimeout(() => {
        const mockUser: User = {
          _id: 'google_user_123',
          name: 'Test Google User',
          email: 'google-test@heartbridge.org',
          role: 'donor',
          profilePicture: 'https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff'
        };
        const mockToken = 'mock_google_jwt_token_' + Date.now();

        this.setAuth(mockToken, mockUser);

        observer.next({ success: true, user: mockUser, token: mockToken });
        observer.complete();
      }, 1000);
    });
  }
  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${API_URL}/auth/verify-email/${token}`).pipe(
      tap((response: any) => {
        if (response.success && response.user) {
          // You could optionally log them in here if success
          // this.setAuth(response.token, response.user);
        }
      })
    );
  }

  verifyOTP(email: string, otp: string): Observable<any> {
    return this.http.post(`${API_URL}/auth/verify-otp`, { email, otp }).pipe(
      tap((response: any) => {
        if (response.success && response.user) {
          // Success
        }
      })
    );
  }
}

