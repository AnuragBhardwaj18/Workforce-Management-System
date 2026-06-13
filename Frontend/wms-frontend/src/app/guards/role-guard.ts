import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const allowedRoles = route.data?.['roles'] as string[];
  const role = localStorage.getItem('role');

  if (role && allowedRoles.includes(role)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
