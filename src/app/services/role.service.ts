import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { IRole } from '../models/role';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private baseUrl = 'http://localhost:3000/role'; // Base URL for authentication-related endpoints

  constructor(private http: HttpClient) { }

  // Centralized error handler
  private handleError(error: HttpErrorResponse) {
    const errorMessage =
      error.error?.message || error.message || 'An unknown error occurred';
    return throwError(() => new Error(errorMessage));
  }

  getUserRoles(communityId:string): Observable<IRole[]>{
    const url = `${this.baseUrl}/user/${communityId}`;
        return this.http.get<{ roles: IRole[] }>(url, {
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        }).pipe(
          map(response => response.roles), // Extract the pendingRequests array
          catchError(this.handleError)
        );
  }

}
