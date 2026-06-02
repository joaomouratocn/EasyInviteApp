import { inject, Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth-service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private router: Router = inject(Router);
  private authService = inject(AuthService);
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<boolean>(false);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authRequest = request.clone({
      withCredentials: true
    });

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !request.url.includes('api/auth/logout')) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(false);

      return this.authService.checkAuth().pipe(
        switchMap(isAuthenticated => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(true);

          if (isAuthenticated) {
            return next.handle(request.clone({ withCredentials: true }));
          } else {
            this.authService.logout().subscribe({
              next: () => {this.router.navigate(['/login']);},
              error: (err) => {console.error('Logout failed', err);},
            });
            return throwError(() => new Error('Sessão expirada'));
          }
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(false);
          return throwError(() => err);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(isRefreshed => isRefreshed),
      take(1),
      switchMap(() => next.handle(request.clone({ withCredentials: true })))
    );
  }
}