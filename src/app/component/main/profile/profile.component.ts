import { Component, inject } from '@angular/core';
import { UserDataService } from '../../../services/user-data.service';
import { IUser } from '../../../models/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  userData: IUser;

  userDataService = inject(UserDataService);

  constructor() {

    this.userData = {
      userName: "",
      email: ""
    }

    this.userDataService.getUserDetails().subscribe((res:any)=>{
      if(res){
        this.userData = res.userData
      }
    })

    
  }

  



}
