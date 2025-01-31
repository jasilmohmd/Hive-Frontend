import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserAuthService } from '../../../services/user-auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-verify',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './email-verify.component.html',
  styleUrl: './email-verify.component.css'
})
export class EmailVerifyComponent implements OnInit{
  emailVerifyForm: FormGroup;
  errorMessage: string = ''; // Property to store the error message
  mode: string = ''; // Can be 'forgot-password' or 'register'

  userAuthService = inject(UserAuthService);

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute) {
    this.emailVerifyForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mode = params['mode'] || 'register'; // Read mode from query params
    });
  }

  onSubmit() {
    if (this.emailVerifyForm.invalid) {
      return;
    }

    

    const email = this.emailVerifyForm.value.email;
    sessionStorage.setItem('otpEmail', email); // Store in sessionStorage

    this.userAuthService.sendOtp(email, this.mode).subscribe({
      next: (res: any) => {
        console.log(res.message); // Success message

         // ✅ Store OTP timestamp in localStorage for timer persistence
         localStorage.setItem('otpTimestamp', Date.now().toString());

        this.router.navigate(['/auth/otp'], { queryParams: { mode: this.mode } }); // Redirect to verify emai using otp page
      },
      error: (error) => {
        console.log(error.message); // Log the error for debugging
        this.errorMessage = error.message; // Store the error message
      },
    });
  }
}
