import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, catchError, throwError } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { UserAuthService } from './user-auth.service';

export interface IMessageReplyTo {
  _id: string;
  content: string;
  type: string;
  sender?: string | { _id: string; userName: string; imageUrl?: string };
  deletedAt?: string;
}

export interface IReactionSummary {
  emoji: string;
  count: number;
  userIds: string[];
  reactedByMe: boolean;
}

export interface IPollSummary {
  question: string;
  options: string[];
  allowMultiple: boolean;
  counts: number[];
  myVotes: number[];
  totalVotes: number;
}

export interface IMessageMetadata {
  linkPreview?: {
    url: string;
    title?: string;
    description?: string;
    image?: string;
  };
  forwardedFrom?: {
    messageId: string;
    chatId: string;
    senderName: string;
  };
}

export interface IChatMessage {
  _id?: string;
  sender: string | { _id: string; userName: string; imageUrl?: string };
  chatId: string;
  content: string;
  type: string;
  timestamp: string;
  edited?: boolean;
  replyTo?: IMessageReplyTo;
  metadata?: string;
  reactions?: IReactionSummary[];
  poll?: IPollSummary;
}

export interface ISendMessageOptions {
  replyToMessageId?: string;
  metadata?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly baseUrl = `${environment.apiUrl}/chat`;
  private socket: Socket | null = null;

  readonly incomingMessage$ = new Subject<IChatMessage>();
  readonly messageEdited$ = new Subject<IChatMessage>();
  readonly messageDeleted$ = new Subject<{ _id: string; chatId: string }>();
  readonly reactionUpdated$ = new Subject<{
    chatId: string;
    messageId: string;
    reactions: IReactionSummary[];
  }>();
  readonly pollUpdated$ = new Subject<{
    chatId: string;
    messageId: string;
    poll: IPollSummary;
  }>();
  readonly chatError$ = new Subject<string>();

  constructor(
    private http: HttpClient,
    private auth: UserAuthService
  ) {}

  private handleError(error: HttpErrorResponse) {
    const errorMessage =
      error.error?.message || error.message || 'An unknown error occurred';
    return throwError(() => new Error(errorMessage));
  }

  getMessageHistory(chatId: string, page = 1, limit = 50): Observable<IChatMessage[]> {
    const url = `${this.baseUrl}/messages/${encodeURIComponent(chatId)}`;
    return this.http
      .get<IChatMessage[]>(url, { params: { page: String(page), limit: String(limit) } })
      .pipe(catchError(this.handleError));
  }

  sendImageMessage(chatId: string, file: File): Observable<IChatMessage> {
    return this.uploadChatFile(chatId, file, 'image');
  }

  sendVideoMessage(chatId: string, file: File): Observable<IChatMessage> {
    return this.uploadChatFile(chatId, file, 'video');
  }

  sendAudioMessage(chatId: string, file: File): Observable<IChatMessage> {
    return this.uploadChatFile(chatId, file, 'audio');
  }

  sendFileMessage(chatId: string, file: File): Observable<IChatMessage> {
    return this.uploadChatFile(chatId, file, 'file');
  }

  private uploadChatFile(
    chatId: string,
    file: File,
    kind: 'image' | 'video' | 'audio' | 'file'
  ): Observable<IChatMessage> {
    const url = `${this.baseUrl}/messages/${kind}`;
    const formData = new FormData();
    formData.append('chatId', chatId);
    formData.append('file', file);
    return this.http.post<IChatMessage>(url, formData).pipe(catchError(this.handleError));
  }

  editMessage(messageId: string, content: string): Observable<IChatMessage> {
    return this.http
      .patch<IChatMessage>(`${this.baseUrl}/messages/${messageId}`, { content })
      .pipe(catchError(this.handleError));
  }

  deleteMessage(messageId: string): Observable<{ _id: string }> {
    return this.http
      .delete<{ _id: string }>(`${this.baseUrl}/messages/${messageId}`)
      .pipe(catchError(this.handleError));
  }

  setReaction(messageId: string, emoji: string): Observable<unknown> {
    return this.http
      .post(`${this.baseUrl}/messages/${messageId}/reactions`, { emoji })
      .pipe(catchError(this.handleError));
  }

  removeReaction(messageId: string): Observable<unknown> {
    return this.http
      .delete(`${this.baseUrl}/messages/${messageId}/reactions`)
      .pipe(catchError(this.handleError));
  }

  votePoll(messageId: string, optionIndexes: number[]): Observable<unknown> {
    return this.http
      .post(`${this.baseUrl}/messages/${messageId}/vote`, { optionIndexes })
      .pipe(catchError(this.handleError));
  }

  static directChatId(userIdA: string, userIdB: string): string {
    return [userIdA, userIdB].sort().join('_');
  }

  ensureSocket(): Socket {
    const token = this.auth.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated (missing token for realtime chat)');
    }
    if (!this.socket) {
      this.socket = io(environment.apiUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      this.socket.on('newMessage', (msg: IChatMessage) => {
        this.incomingMessage$.next(msg);
      });

      this.socket.on('messageEdited', (msg: IChatMessage) => {
        this.messageEdited$.next(msg);
      });

      this.socket.on('messageDeleted', (payload: { _id: string; chatId: string }) => {
        this.messageDeleted$.next(payload);
      });

      this.socket.on(
        'reactionUpdated',
        (payload: { chatId: string; messageId: string; reactions: IReactionSummary[] }) => {
          this.reactionUpdated$.next(payload);
        }
      );

      this.socket.on(
        'pollUpdated',
        (payload: { chatId: string; messageId: string; poll: IPollSummary }) => {
          this.pollUpdated$.next(payload);
        }
      );

      this.socket.on('chatError', (payload: { message?: string }) => {
        this.chatError$.next(payload?.message ?? 'Chat error');
      });

      this.socket.on('connect_error', () => {
        this.chatError$.next('Realtime connection failed');
      });
    }
    return this.socket;
  }

  joinChat(chatId: string): void {
    const s = this.ensureSocket();
    s.emit('joinChat', chatId);
  }

  sendMessage(chatId: string, content: string, type = 'text', options?: ISendMessageOptions): void {
    const s = this.ensureSocket();
    s.emit('sendMessage', {
      chatId,
      content,
      type,
      replyToMessageId: options?.replyToMessageId,
      metadata: options?.metadata,
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}
