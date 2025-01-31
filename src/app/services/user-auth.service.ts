import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { catchError, throwError, Observable } from 'rxjs';
import { ILoginCredentials, IRegisterationCredentials } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserAuthService {
  private baseUrl = 'http://localhost:3000/auth'; // Base URL for authentication-related endpoints

  constructor(private http: HttpClient) {}

  // Centralized error handler
  private handleError(error: HttpErrorResponse) {
    const errorMessage =
      error.error?.message || error.message || 'An unknown error occurred';
    return throwError(() => new Error(errorMessage));
  }

  userRegister(regObj: IRegisterationCredentials): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, regObj).pipe(
      catchError(this.handleError)
    );
  }

  userLogin(loginObj: ILoginCredentials): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, loginObj).pipe(
      catchError(this.handleError)
    );
  }

  handelLogout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}).pipe(
      catchError(this.handleError)
    );
  }

  isUserAuthenticated(): Observable<any> {
    return this.http.post(`${this.baseUrl}/isUserAuthenticated`, {}).pipe(
      catchError(this.handleError)
    );
  }

  sendOtp(email: string, mode: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/send-otp`, { email, mode }).pipe(
      catchError(this.handleError)
    );
  }

  otpVerification(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/otp_verify`, { email, otp }).pipe(
      catchError(this.handleError)
    );
  }

  setNewPassword(email: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/set_new_password`, {email, newPassword, confirmPassword }).pipe(
      catchError(this.handleError)
    );
  }

}
