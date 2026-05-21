import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ILoginCredentials, IRegisterationCredentials, IUser } from '../models/user';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

const ACCESS_TOKEN_KEY = 'hive_access_token';

@Injectable({
  providedIn: 'root'
})
export class UserAuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {
    // no-op
  }

  persistAccessToken(token: string): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  clearAccessToken(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  private handleError(error: HttpErrorResponse) {
    const errorMessage =
      error.error?.message || error.message || 'An unknown error occurred';
    return throwError(() => new Error(errorMessage));
  }

  userRegister(regObj: IRegisterationCredentials): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, regObj).pipe(
      tap((res: any) => {
        if (res?.token) {
          this.persistAccessToken(res.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  userLogin(loginObj: ILoginCredentials): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, loginObj).pipe(
      tap((res: any) => {
        if (res?.token) {
          this.persistAccessToken(res.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  handelLogout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => this.clearAccessToken()),
      catchError(this.handleError)
    );
  }

  isUserAuthenticated(): Observable<any> {
    return this.http.post(`${this.baseUrl}/isUserAuthenticated`, {}).pipe(
      tap((res: any) => {
        if (res?.token) {
          this.persistAccessToken(res.token);
        }
      }),
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

  getUserDetails() {
    return this.http
      .get<{ message: string; userData: IUser & { _id?: string } | null }>(`${this.baseUrl}/details`)
      .pipe(catchError(this.handleError));
  }

}
