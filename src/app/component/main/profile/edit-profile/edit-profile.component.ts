import { Component } from '@angular/core';
import { UserProfileService } from '../../../../services/user-profile.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent {
  editProfileForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private userProfileService: UserProfileService, private router: Router) {
    this.editProfileForm = this.fb.group({
      newUserName: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    // Optionally, prefill with the current username:
    // this.editProfileForm.patchValue({ newUserName: currentUser.userName });
  }

  updateProfile(): void {
    if (this.editProfileForm.invalid) {
      return;
    }
    const newUserName = this.editProfileForm.value.newUserName;
    this.userProfileService.editProfile(newUserName).subscribe({
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
