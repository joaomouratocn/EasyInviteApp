import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private storageKey = 'auth_user';

  private _user = signal<any | null>(this.loadUser());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());

  setUser(response: any) {
    const payload = this.decodeJwt(response.credential);

    const user = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };

    this._user.set(user);
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.router.navigate(['/dashboard']);
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

  private decodeJwt(token: string) {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(json);
  }
}
