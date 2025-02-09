import { Component, inject } from '@angular/core';
import { IUser } from '../../../models/user';
import { UserAuthService } from '../../../services/user-auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  userData: IUser;
  errorMessage: string = ''; // Property to store the error message

  userAuthService = inject(UserAuthService);

  constructor(private router: Router) {

    this.userData = {
      userName: "",
      email: ""
    }

    this.userAuthService.getUserDetails().subscribe((res:any)=>{
      if(res){
        this.userData = res.userData
      }
    })

    
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
