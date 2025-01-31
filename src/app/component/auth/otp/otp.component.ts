import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserAuthService } from '../../../services/user-auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.css'
})
export class OtpComponent {

  otpForm: FormGroup;
  errorMessage: string = ''; // Property to store the error message
  email: string = '';
  mode: string = ''; // Can be 'forgot-password' or 'register'
  countdown: number = 0;
  timer: any;

  userAuthService = inject(UserAuthService);

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]],
    });

  }

  ngOnInit() {
    this.email = sessionStorage.getItem('otpEmail') || "";
    console.log('Email:', this.email);
    this.route.queryParams.subscribe(params => {
      this.mode = params['mode'] || 'register'; // Default mode is 'register'
    });
    this.resumeCountdown();
  }

  /** Function to resume countdown from last timestamp */
  resumeCountdown(): void {
    const storedTime = localStorage.getItem('otpTimestamp');

    if (storedTime) {
      const elapsedTime = Math.floor((Date.now() - parseInt(storedTime)) / 1000);
      this.countdown = Math.max(60 - elapsedTime, 0);
    } else {
      this.countdown = 60;
      localStorage.setItem('otpTimestamp', Date.now().toString());
    }

    this.startCountdown();
  }

  startCountdown(): void {
    clearInterval(this.timer);

    this.timer = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  resendOtp() {

    if (this.countdown > 0) return;

    this.userAuthService.sendOtp(this.email, this.mode).subscribe({
      next: (res: any) => {
        console.log(res.message); // Success message
        
        // ✅ Reset timestamp & restart countdown
        localStorage.setItem('otpTimestamp', Date.now().toString());
        this.resumeCountdown(); // Restart countdown properly
      },
      error: (error) => {
        console.log(error.message); // Log the error for debugging
        this.errorMessage = error.message; // Store the error message
      },
    });
  }

  onSubmit() {

    if (this.otpForm.invalid) {
      return;
    }

    const otp = this.otpForm.value.otp;

    if (!this.email) {
      this.errorMessage = 'Email is missing. Please restart the process.';
      return;
    }

    this.userAuthService.otpVerification(this.email, otp).subscribe({
      next: (res: any) => {
        if (this.mode === 'forgot-password') {
          this.router.navigate(['/auth/change_pass']);
        } else {
          this.router.navigate(['/auth/register']);
        }
      },
      error: (error) => {
        console.log(error.message); // Log the error for debugging
        this.errorMessage = error.message; // Store the error message
      },
    });
  }

}
