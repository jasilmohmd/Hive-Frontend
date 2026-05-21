import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';

@Component({
  selector: 'app-chat-voice-recorder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-voice-recorder.component.html',
})
export class ChatVoiceRecorderComponent implements OnDestroy {
  @Output() recorded = new EventEmitter<File>();
  @Output() dismiss = new EventEmitter<void>();

  recording = false;
  error: string | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private maxTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    this.stopTracks();
  }

  async startRecording(): Promise<void> {
    this.error = null;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.chunks = [];
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        this.recorded.emit(file);
        this.stopTracks();
      };
      this.mediaRecorder.start();
      this.recording = true;
      this.maxTimer = setTimeout(() => this.stopRecording(), 60_000);
    } catch {
      this.error = 'Microphone access denied or unavailable.';
    }
  }

  stopRecording(): void {
    if (this.maxTimer) {
      clearTimeout(this.maxTimer);
      this.maxTimer = null;
    }
    if (this.mediaRecorder && this.recording) {
      this.mediaRecorder.stop();
      this.recording = false;
    }
  }

  private stopTracks(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }
}
