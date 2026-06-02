// src/app/core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from 'service-core';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // ✅ Adiciona withCredentials em todas as requisições
    const authRequest = request.clone({
      withCredentials: true,
    });

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !request.url.includes('/auth/logout')) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      }),
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(false);

      // ✅ Tenta verificar autenticação (cookie pode ainda ser válido)
      return this.authService.checkAuth().pipe(
        switchMap((isAuthenticated) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(true);

          if (isAuthenticated) {
            return next.handle(request.clone({ withCredentials: true }));
          } else {
            // ✅ Não é mais autenticado → redireciona para login
            this.authService.logout();
            return throwError(() => new Error('Sessão expirada'));
          }
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(false);
          return throwError(() => err);
        }),
      );
    }

    return this.refreshTokenSubject.pipe(
      filter((isRefreshed) => isRefreshed),
      take(1),
      switchMap(() => next.handle(request.clone({ withCredentials: true }))),
    );
  }
}
