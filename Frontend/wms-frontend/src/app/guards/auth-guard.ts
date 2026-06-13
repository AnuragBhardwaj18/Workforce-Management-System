import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    if (localStorage.getItem('needsPasswordChange') === 'true') {
      router.navigate(['/change-password']);
      return false;
    }
    return true;
  }

  router.navigate(['/login']);
  return false;
};
