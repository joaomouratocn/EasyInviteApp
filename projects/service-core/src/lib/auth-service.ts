import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest, RegisterRequest, User } from 'models-core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api';
  private router = inject(Router);

  private readonly USER_KEY = 'user';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Carrega usuário do localStorage ao iniciar (apenas dados, não token)
    const storedUser = localStorage.getItem(this.USER_KEY);
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(request: LoginRequest): Observable<User> {
    return this.http
      .post<User>(`${this.API_URL}/api/auth/login`, request, {
        withCredentials: true,
      })
      .pipe(
        tap((user) => {
          this.currentUserSubject.next(user);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }),
      );
  }

  register(request: RegisterRequest): Observable<User> {
    return this.http
      .post<User>(`${this.API_URL}/api/auth/register`, request, {
        withCredentials: true,
      })
      .pipe(
        tap((user) => {
          this.currentUserSubject.next(user);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }),
      );
  }

  googleAuth(credential: string): Observable<User> {
    return this.http
      .post<User>(
        `${this.API_URL}/auth/google`,
        { credential },
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap((user) => {
          this.currentUserSubject.next(user);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }),
      );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(
        `${this.API_URL}/api/auth/logout`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap(() => {
          this.currentUserSubject.next(null);
          localStorage.removeItem(this.USER_KEY);
          this.router.navigate(['/login']);
        }),
      );
  }

  checkAuth(): Observable<boolean> {
    return this.http
      .get<{ authenticated: boolean; user?: User }>('/api/auth/me', { withCredentials: true })
      .pipe(
        tap((response) => {
          if (response.user) {
            this.currentUserSubject.next(response.user);
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
          } else {
            this.currentUserSubject.next(null);
            localStorage.removeItem(this.USER_KEY);
          }
        }),
        map((response) => response.authenticated),
      );
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
