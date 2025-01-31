import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserAuthService } from '../../../services/user-auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  setNewPassForm: FormGroup;
  errorMessage: string = ''; // Property to store the error message
  email: string  = '';

  userAuthService = inject(UserAuthService);

  constructor(private fb: FormBuilder, private router: Router){
    this.setNewPassForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordsMatch });
  }

  ngOnInit() {
    this.email = sessionStorage.getItem('otpEmail') || "";
    console.log('Email:', this.email);
  }

  onSubmit() {
    if (this.setNewPassForm.invalid) {
      return;
    }

    const email = this.email;

    const { newPassword, confirmPassword } = this.setNewPassForm.value;

    this.userAuthService.setNewPassword(email,newPassword,confirmPassword).subscribe({
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

  // Custom Validator: Check if passwords match
  private passwordsMatch(control: AbstractControl) {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
  
    if (!newPassword || !confirmPassword) return null;
  
    if (confirmPassword.errors && !confirmPassword.errors['mismatch']) {
      return null; // Return if other errors exist
    }
  
    if (newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true }); // Set error manually
    } else {
      confirmPassword.setErrors(null); // Clear error if passwords match
    }
  
    return null;
  }

}
