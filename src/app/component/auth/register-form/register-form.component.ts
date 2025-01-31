import { Component, inject, OnInit } from '@angular/core';
import { UserAuthService } from '../../../services/user-auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css'
})
export class RegisterFormComponent implements OnInit{
  registerForm: FormGroup;
  errorMessage: string = ''; // Property to store the error message
  email: string  = '';
  
  userAuthService = inject(UserAuthService);
  
  constructor(private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validator: this.passwordMatchValidator });
  }
  ngOnInit(): void {
    this.email = sessionStorage.getItem('otpEmail') || "";
    console.log('Email:', this.email);
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onRegister() {
    if (this.registerForm.invalid) {
      return;
    }

    const email = this.email;

    const { userName, password, confirmPassword } = this.registerForm.value;
    const regObj = { email, userName, password, confirmPassword }

    this.userAuthService.userRegister( regObj ).subscribe({
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
