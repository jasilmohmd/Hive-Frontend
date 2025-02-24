import { Component, inject } from '@angular/core';
import { IUser } from '../../../models/user';
import { UserAuthService } from '../../../services/user-auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  userData: IUser;
  errorMessage: string = ''; // Property to store the error message
  successMessage: string = '';

  userAuthService = inject(UserAuthService);

  constructor(private router: Router) {
    // Initialize with default values
    this.userData = {
      userName: "",
      email: "",
    };
  }

  ngOnInit(): void {
    // Use history.state to retrieve navigation extras after the navigation is complete
    const nav = this.router.getCurrentNavigation();
    if (history.state && history.state.successMessage) {
      this.successMessage = history.state.successMessage;

      history.replaceState({}, document.title);
      // Automatically clear the success message after 3 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }

    // Fetch user details
    this.userAuthService.getUserDetails().subscribe((res: any) => {
      if (res) {
        this.userData = res.userData;
      }
    });
  }

  logout(){
    this.userAuthService.handelLogout().subscribe({
      next: (res: any) => {
        console.log(res.message); // Success message
        this.router.navigateByUrl('/auth/login');
      },
      error: (error) => {
        console.log(error.message); // Log the error for debugging
        this.errorMessage = error.message; // Store the error message
      },
    })
  }

  



}
