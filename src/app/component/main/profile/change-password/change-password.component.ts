import { Component } from '@angular/core';
import { UserProfileService } from '../../../../services/user-profile.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder, 
    private userProfileService: UserProfileService, 
    private router: Router
  ) {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsValidator() });
  }

  // Custom validator: 
  // - Checks that newPassword is different from oldPassword.
  // - Checks that newPassword matches confirmPassword.
  private passwordsValidator(): ValidatorFn {
    return (group: AbstractControl): { [key: string]: any } | null => {
      const oldPassword = group.get('oldPassword')?.value;
      const newPassword = group.get('newPassword')?.value;
      const confirmPassword = group.get('confirmPassword')?.value;
      const errors: any = {};

      if (oldPassword && newPassword && oldPassword === newPassword) {
        errors.sameAsOld = true;
      }

      if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        errors.mismatch = true;
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  updatePassword(): void {
    if (this.changePasswordForm.invalid) {
      return;
    }
    const { oldPassword, newPassword } = this.changePasswordForm.value;
    this.userProfileService.changePassword(oldPassword, newPassword).subscribe({
      next: (res) => {
        // On success, navigate back to the profile page
        this.router.navigate(['/main/profile'], { state: { successMessage: res.message } });
      },
      error: (err) => {
        this.errorMessage = err.message;
      }
    });
  }
}
