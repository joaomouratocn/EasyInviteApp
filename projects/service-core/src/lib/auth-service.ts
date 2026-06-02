import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest, RegisterRequest, User } from 'models-core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api';

  private readonly USER_KEY = 'user';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  login(request: LoginRequest): Observable<User> {
    return this.http
      .post<User>(`${this.API_URL}/auth/login`, request,)
      .pipe(
        tap((user) => {
          this.currentUserSubject.next(user);
        }),
      );
  }

  register(request: RegisterRequest): Observable<User> {
    return this.http
      .post<User>(`${this.API_URL}/auth/register`, request,)
      .pipe(
        tap((user) => {
          this.currentUserSubject.next(user);
        }),
      );
  }

  googleAuth(credential: string): Observable<User> {
    return this.http
      .post<User>(
        `${this.API_URL}/auth/google`,
        { credential },
      )
      .pipe(
        tap((user) => {
          this.currentUserSubject.next(user);
        }),
      );
  }

  logout(): Observable<any> {
    console.log('Logout initiated');
    return this.http.post<any>(
        `${this.API_URL}/auth/logout`,
        {},
      )
      .pipe(
        tap(() => {
          this.currentUserSubject.next(null);
        }),
      );
  }

  checkAuth(): Observable<boolean> {
    return this.http
      .get<{ authenticated: boolean; user?: User }>(`${this.API_URL}/auth/logged`)
      .pipe(
        tap((response) => {
          if (response.user) {
            this.currentUserSubject.next(response.user);
          } else {
            this.currentUserSubject.next(null);
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
