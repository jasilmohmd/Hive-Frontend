import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { ChatService } from './chat.service';
import { CallRingtoneService } from './call-ringtone.service';

export type CallType = 'audio' | 'video';
export type CallState =
  | 'idle'
  | 'outgoing'
  | 'incoming'
  | 'connecting'
  | 'active'
  | 'unavailable'
  | 'ended';

export interface IIncomingCall {
  callId: string;
  chatId: string;
  callType: CallType;
  callerId: string;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

@Injectable({
  providedIn: 'root',
})
export class CallService {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private callId: string | null = null;
  private chatId: string | null = null;
  private peerId: string | null = null;
  private role: 'caller' | 'callee' | null = null;
  private callType: CallType = 'audio';
  private socketListenersBound = false;
  private pendingIceCandidates: RTCIceCandidateInit[] = [];
  private remoteDescriptionSet = false;
  private unavailableDismissTimer: ReturnType<typeof setTimeout> | null = null;

  readonly incomingCall$ = new Subject<IIncomingCall>();
  readonly callAccepted$ = new Subject<{ callId: string; chatId: string }>();
  readonly callEnded$ = new Subject<{ callId: string; chatId: string; endedBy?: string }>();
  readonly callRejected$ = new Subject<{ callId: string; chatId: string }>();
  readonly remoteStream$ = new Subject<MediaStream | null>();
  readonly callError$ = new Subject<string>();
  readonly callState$ = new BehaviorSubject<CallState>('idle');

  readonly callType$ = new BehaviorSubject<CallType>('audio');

  constructor(
    private chat: ChatService,
    private ringtone: CallRingtoneService
  ) {
    this.chat.onSocketReady((socket) => this.bindSocketEventsIfNeeded(socket));
    this.callState$.subscribe((state) => {
      if (state === 'outgoing') this.ringtone.playOutgoing();
      else if (state === 'incoming') this.ringtone.playIncoming();
      else if (state !== 'unavailable') this.ringtone.stop();
    });
  }

  async connect(): Promise<void> {
    const socket = await this.chat.connectRealtime();
    this.bindSocketEventsIfNeeded(socket);
  }

  private bindSocketEventsIfNeeded(socket: Socket): void {
    if (this.socketListenersBound) return;
    this.bindSocketEvents(socket);
    this.socketListenersBound = true;
  }

  get activeCallId(): string | null {
    return this.callId;
  }

  get activeChatId(): string | null {
    return this.chatId;
  }

  get activeCallType(): CallType {
    return this.callType;
  }

  get localMediaStream(): MediaStream | null {
    return this.localStream;
  }

  isInCall(): boolean {
    const s = this.callState$.value;
    return s === 'outgoing' || s === 'incoming' || s === 'connecting' || s === 'active';
  }

  /** Release local capture tracks (voice notes after a call). */
  releaseMediaDevices(): void {
    this.stopLocalStream();
  }

  async startCall(chatId: string, peerId: string, callType: CallType): Promise<void> {
    try {
      await this.connect();
      if (this.isInCall()) {
        this.callError$.next('Already in a call');
        return;
      }
      this.resetCallMedia();
      this.callId = crypto.randomUUID();
      this.chatId = chatId;
      this.peerId = peerId;
      this.role = 'caller';
      this.callType = callType;
      this.callType$.next(callType);
      this.callState$.next('outgoing');

      await this.initLocalMedia(callType);
      const socket = await this.chat.connectRealtime();
      socket.emit('call:invite', {
        callId: this.callId,
        chatId,
        callType,
      });
    } catch (e) {
      this.callError$.next((e as Error).message);
      this.endCallLocal();
      throw e;
    }
  }

  async acceptCall(incoming?: IIncomingCall): Promise<void> {
    await this.connect();
    const call = incoming ?? this.getPendingIncoming();
    if (!call) return;

    this.callId = call.callId;
    this.chatId = call.chatId;
    this.peerId = call.callerId;
    this.role = 'callee';
    this.callType = call.callType;
    this.callType$.next(call.callType);
    this.callState$.next('connecting');

    try {
      await this.initLocalMedia(call.callType);
      const socket = await this.chat.connectRealtime();
      socket.emit('call:accept', {
        callId: call.callId,
        chatId: call.chatId,
      });
    } catch (e) {
      this.callError$.next((e as Error).message);
      this.abortCallSetup();
    }
  }

  rejectCall(): void {
    if (!this.callId || !this.chatId) {
      this.callState$.next('idle');
      return;
    }
    const socket = this.chat.ensureSocket();
    socket.emit('call:reject', {
      callId: this.callId,
      chatId: this.chatId,
    });
    this.endCallLocal();
  }

  endCall(): void {
    if (this.callId && this.chatId && this.isInCall()) {
      this.chat.ensureSocket().emit('call:end', {
        callId: this.callId,
        chatId: this.chatId,
      });
    }
    this.endCallLocal();
  }

  /** Media/setup failed — end call for both sides without implying the user declined. */
  private abortCallSetup(): void {
    this.endCall();
  }

  toggleMute(): boolean {
    const track = this.localStream?.getAudioTracks()[0];
    if (!track) return false;
    track.enabled = !track.enabled;
    return track.enabled;
  }

  toggleCamera(): boolean {
    const track = this.localStream?.getVideoTracks()[0];
    if (!track) return false;
    track.enabled = !track.enabled;
    return track.enabled;
  }

  private getPendingIncoming(): IIncomingCall | null {
    if (this.callState$.value !== 'incoming' || !this.callId || !this.chatId || !this.peerId) {
      return null;
    }
    return {
      callId: this.callId,
      chatId: this.chatId,
      callType: this.callType,
      callerId: this.peerId,
    };
  }

  private bindSocketEvents(socket: Socket): void {
    socket.on('call:incoming', (payload: IIncomingCall) => {
      if (this.isInCall() && this.callState$.value !== 'incoming') return;
      this.callId = payload.callId;
      this.chatId = payload.chatId;
      this.peerId = payload.callerId;
      this.callType = payload.callType;
      this.callType$.next(payload.callType);
      this.role = 'callee';
      this.callState$.next('incoming');
      this.incomingCall$.next(payload);
    });

    socket.on('call:ringing', (payload: { callId: string }) => {
      if (payload.callId === this.callId && this.role === 'caller') {
        this.callState$.next('outgoing');
      }
    });

    socket.on('call:accepted', async (payload: { callId: string; chatId: string }) => {
      if (payload.callId !== this.callId) return;
      try {
        this.callState$.next('connecting');
        this.callAccepted$.next(payload);
        if (this.role === 'caller') {
          await this.createAndSendOffer();
        }
      } catch (e) {
        this.callError$.next((e as Error).message);
        this.endCall();
      }
    });

    socket.on('call:rejected', (payload: { callId: string; chatId: string }) => {
      if (payload.callId !== this.callId) return;
      this.callRejected$.next(payload);
      this.callError$.next('Call declined');
      this.endCallLocal();
    });

    socket.on('call:ended', (payload: { callId: string; chatId: string; endedBy?: string }) => {
      if (payload.callId !== this.callId) return;
      this.callEnded$.next(payload);
      this.endCallLocal();
    });

    socket.on('call:busy', (payload: { callId?: string }) => {
      if (payload?.callId && payload.callId !== this.callId) return;
      this.callError$.next('User is busy');
      this.endCallLocal();
    });

    socket.on('call:unavailable', (payload: { callId?: string; chatId?: string }) => {
      if (payload?.callId && payload.callId !== this.callId) return;
      this.handlePeerUnavailable();
    });

    socket.on('call:error', (payload: { message?: string }) => {
      this.callError$.next(payload?.message ?? 'Call error');
      this.endCallLocal();
    });

    socket.on('call:offer', async (payload: { callId: string; sdp: RTCSessionDescriptionInit }) => {
      if (payload.callId !== this.callId) return;
      try {
        await this.handleOffer(payload.sdp);
      } catch (e) {
        this.callError$.next((e as Error).message);
        this.endCall();
      }
    });

    socket.on('call:answer', async (payload: { callId: string; sdp: RTCSessionDescriptionInit }) => {
      if (payload.callId !== this.callId) return;
      try {
        await this.handleAnswer(payload.sdp);
      } catch (e) {
        this.callError$.next((e as Error).message);
        this.endCall();
      }
    });

    socket.on(
      'call:ice-candidate',
      async (payload: { callId: string; candidate: RTCIceCandidateInit }) => {
        if (payload.callId !== this.callId) return;
        await this.addIceCandidate(payload.candidate);
      }
    );
  }

  private async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.pc || !this.remoteDescriptionSet) {
      this.pendingIceCandidates.push(candidate);
      return;
    }
    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch {
      /* ignore late/duplicate candidates */
    }
  }

  private async flushPendingIceCandidates(): Promise<void> {
    if (!this.pc) return;
    const pending = [...this.pendingIceCandidates];
    this.pendingIceCandidates = [];
    for (const c of pending) {
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(c));
      } catch {
        /* ignore */
      }
    }
  }

  /**
   * Phase 1 (WebRTC P2P): direct getUserMedia for testing.
   * Phase 2 (LiveKit): restore device-busy detection, staged release, and sequential capture fallback.
   */
  private async initLocalMedia(callType: CallType): Promise<void> {
    this.stopLocalStream();
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Microphone/camera not supported in this browser');
    }
    if (callType !== 'video') {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      return;
    }

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
    } catch (err) {
      if (!this.isVideoCaptureBlocked(err)) throw err;
      // Same PC / two browsers: caller may already hold the camera — join with mic only.
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
    }
  }

  private isVideoCaptureBlocked(err: unknown): boolean {
    const name = (err as DOMException)?.name ?? '';
    return (
      name === 'NotReadableError' ||
      name === 'TrackStartError' ||
      name === 'AbortError' ||
      name === 'OverconstrainedError'
    );
  }

  private createPeerConnection(): RTCPeerConnection {
    this.cleanupPeerConnection();
    this.remoteDescriptionSet = false;
    this.pendingIceCandidates = [];

    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.localStream?.getTracks().forEach((track) => {
      if (this.localStream) {
        pc.addTrack(track, this.localStream);
      }
    });
    pc.onicecandidate = (ev) => {
      if (ev.candidate && this.callId) {
        this.chat.ensureSocket().emit('call:ice-candidate', {
          callId: this.callId,
          candidate: ev.candidate.toJSON(),
        });
      }
    };
    pc.ontrack = (ev) => {
      const stream = ev.streams[0] ?? new MediaStream([ev.track]);
      this.remoteStream$.next(stream);
      this.callState$.next('active');
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        this.callError$.next('Connection failed');
        this.endCall();
      }
    };
    this.pc = pc;
    return pc;
  }

  private async createAndSendOffer(): Promise<void> {
    const pc = this.createPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const socket = await this.chat.connectRealtime();
    socket.emit('call:offer', {
      callId: this.callId,
      sdp: offer,
    });
  }

  private async handleOffer(sdp: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.createPeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    this.remoteDescriptionSet = true;
    await this.flushPendingIceCandidates();
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    const socket = await this.chat.connectRealtime();
    socket.emit('call:answer', {
      callId: this.callId,
      sdp: answer,
    });
  }

  private async handleAnswer(sdp: RTCSessionDescriptionInit): Promise<void> {
    if (!this.pc) return;
    await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    this.remoteDescriptionSet = true;
    await this.flushPendingIceCandidates();
    this.callState$.next('active');
  }

  private stopLocalStream(): void {
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;
  }

  private cleanupPeerConnection(): void {
    if (this.pc) {
      this.pc.getSenders().forEach((s) => s.track?.stop());
      this.pc.getReceivers().forEach((r) => r.track?.stop());
      this.pc.close();
    }
    this.pc = null;
    this.remoteDescriptionSet = false;
    this.pendingIceCandidates = [];
    this.remoteStream$.next(null);
  }

  private resetCallMedia(): void {
    this.cleanupPeerConnection();
    this.stopLocalStream();
  }

  private handlePeerUnavailable(): void {
    this.clearUnavailableDismissTimer();
    this.ringtone.stop();
    this.stopLocalStream();
    this.callState$.next('unavailable');
    this.unavailableDismissTimer = setTimeout(() => {
      if (this.callState$.value === 'unavailable') {
        this.endCallLocal();
      }
    }, 4000);
  }

  private clearUnavailableDismissTimer(): void {
    if (this.unavailableDismissTimer) {
      clearTimeout(this.unavailableDismissTimer);
      this.unavailableDismissTimer = null;
    }
  }

  private endCallLocal(): void {
    this.clearUnavailableDismissTimer();
    this.ringtone.stop();
    this.resetCallMedia();
    this.remoteStream$.next(null);
    this.callId = null;
    this.chatId = null;
    this.peerId = null;
    this.role = null;
    this.callState$.next('idle');
  }
}
