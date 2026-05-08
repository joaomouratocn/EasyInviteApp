import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'service-core';

export const AuthGuardLogout: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isLoggedIn()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
