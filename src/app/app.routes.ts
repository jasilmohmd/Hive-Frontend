import { Routes } from '@angular/router';
import { LayoutComponent as AuthLayoutComponent } from './component/auth/layout/layout.component';
import { LoginFormComponent } from './component/auth/login-form/login-form.component';
import { RegisterFormComponent } from './component/auth/register-form/register-form.component';
import { LandingPageComponent } from './component/landing-page/landing-page.component';
import { OtpComponent } from './component/auth/otp/otp.component';
import { ChangePasswordComponent } from './component/auth/change-password/change-password.component';
import { LayoutComponent as AppLayoutComponent } from './component/main/layout/layout.component';
import { LayoutComponent as FriendSectionLayoutComponent } from './component/main/friends-section/layout/layout.component';
import { DiscoverComponent } from './component/main/discover/discover.component';
import { ProfileComponent } from './component/main/profile/profile.component';
import { FriendsComponent } from './component/main/friends-section/friends/friends.component';
import { OnlineComponent } from './component/main/friends-section/online/online.component';
import { PendingComponent } from './component/main/friends-section/pending/pending.component';
import { AddfriendComponent } from './component/main/friends-section/addfriend/addfriend.component';
import { BlockedComponent } from './component/main/friends-section/blocked/blocked.component';
import { DirectMessageComponent } from './component/main/direct-message/direct-message.component';
import { EmailVerifyComponent } from './component/auth/email-verify/email-verify.component';


export const routes: Routes = [
  { path: "", component: LandingPageComponent },
  { path:"auth", component: AuthLayoutComponent,
    children:[
      { path: "login", component: LoginFormComponent },
      { path: "register", component: RegisterFormComponent },
      { path: "email_verify", component: EmailVerifyComponent },
      { path: "otp", component: OtpComponent },
      { path: "change_pass", component: ChangePasswordComponent }
    ]
   },
   { path: "main", component: AppLayoutComponent, 
      children: [
        { path: "discover" , component: DiscoverComponent},
        { path: "profile", component: ProfileComponent },
        { path: "friends_section", component: FriendSectionLayoutComponent ,
          children: [
            { path: "friends", component: FriendsComponent },
            { path: "online", component: OnlineComponent },
            { path: "pending", component: PendingComponent },
            { path: "blocked", component: BlockedComponent },
            { path: "addfriend", component: AddfriendComponent }
          ]
        },
        { path: "direct_message", component: DirectMessageComponent }
      ]
   }
];
