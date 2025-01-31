import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserAuthService } from '../../../services/user-auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  loginForm: FormGroup;
  errorMessage: string = ''; // Property to store the error message

  userAuthService = inject(UserAuthService);

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      return;
    }

    this.userAuthService.userLogin(this.loginForm.value).subscribe({
      next: (res: any) => {
        console.log(res.message); // Success message
        this.router.navigateByUrl('/main/discover');
      },
      error: (error) => {
        console.log(error.message); // Log the error for debugging
        this.errorMessage = error.message; // Store the error message
      },
    });
  }
}
