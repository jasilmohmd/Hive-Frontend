import { Component, inject } from '@angular/core';
import { IUser } from '../../../models/user';
import { UserAuthService } from '../../../services/user-auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  userData: IUser;

  userAuthService = inject(UserAuthService);

  constructor() {

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

  



}
