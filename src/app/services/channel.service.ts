import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { IChannel } from '../models/channel';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  private baseUrl = 'http://localhost:3000/channel'; // Base URL for authentication-related endpoints

  constructor(private http: HttpClient) { }

  // Centralized error handler
  private handleError(error: HttpErrorResponse) {
    const errorMessage =
      error.error?.message || error.message || 'An unknown error occurred';
    return throwError(() => new Error(errorMessage));
  }

  createChannel(communityId: string, data: IChannel): Observable<Partial<IChannel>> {
    const url = `${this.baseUrl}/create/${communityId}`;
    return this.http.post(url, { data }).pipe(
      catchError(this.handleError)
    );
  }

  editChannel(communityId: string, channelId: string, data: Partial<IChannel>) {
    const url = `${this.baseUrl}/update/${communityId}/${channelId}`;
    return this.http.put(url, { data }).pipe(
      catchError(this.handleError)
    );
  }

  deleteChannel(communityId: string, channelId: string) {
    const url = `${this.baseUrl}/delete/${communityId}/${channelId}`;
    return this.http.delete(url).pipe(
      catchError(this.handleError)
    );
  }

  getAccessibleChannels(communityId: string): Observable<{ [key in 'info' | 'chatroom' | 'voice']?: IChannel[] }> {
    const url = `${this.baseUrl}/list/${communityId}`
    return this.http.get<{ groupedChannels: { [key in 'info' | 'chatroom' | 'voice']?: IChannel[] } }>(url).pipe(
      map(response => response.groupedChannels),
      catchError(this.handleError)
    );
  }

}
