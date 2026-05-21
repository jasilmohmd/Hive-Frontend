import { Injectable } from '@angular/core';
import { CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserAuthService } from '../services/user-auth.service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardChild implements CanActivateChild {
  constructor(private authService: UserAuthService, private router: Router) {}

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isUserAuthenticated().pipe(
      map((response) => {
        // If user is authenticated and trying to access any route under /auth, redirect them
        if (state.url === '' || state.url === '/' || state.url.startsWith('/auth')) {
          // Redirect to home/dashboard or any page if already authenticated
          this.router.navigate(['/main/discover']);
          return false;  // Block navigation to any auth routes
        }

        // Allow navigation if the user is authenticated and not trying to access any /auth route
        return true;
      }),
      catchError((error) => {
        // If the user is not authenticated and trying to access protected pages
        if (state.url.startsWith('/auth')) {
          return of(true); // Allow access to login or other auth-related pages if not authenticated
        }

        // If the user is not authenticated, redirect to login page
        this.router.navigate(['/auth/login']);
        return of(false);  // Block navigation to other pages
      })
    );
  }
}
