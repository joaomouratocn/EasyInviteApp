import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserLoginResponseDto } from 'models-core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api';
  private router = inject(Router);
  private storageKey = 'auth_user';

  private _user = signal<any | null>(this.loadUser());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());

  loginUser(googleResponse: any) {
    const credential: string = googleResponse.credential;
    this.http.post<UserLoginResponseDto>(`${this.API_URL}/auth/google`, { credential }).subscribe({
      next: (response) => {
            this._user.set(response);
        localStorage.setItem(this.storageKey, JSON.stringify(response));
        this.router.navigate(['/dashboard']);
      },
      error: (err) => console.error('Login failed:', err)
    });
  }

  logout() {
    this._user.set(null);
    localStorage.removeItem(this.storageKey);
    this.router.navigate(['/login']);
  }

  private loadUser() {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : null;
  }
}
