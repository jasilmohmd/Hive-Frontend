import { Routes } from '@angular/router';
import { LayoutComponent as AuthLayoutComponent } from './component/auth/layout/layout.component';
import { LoginFormComponent } from './component/auth/login-form/login-form.component';
import { RegisterFormComponent } from './component/auth/register-form/register-form.component';
import { LandingPageComponent } from './component/landing-page/landing-page.component';
import { ForgotPasswordComponent } from './component/auth/forgot-password/forgot-password.component';
import { OtpComponent } from './component/auth/otp/otp.component';
import { ChangePasswordComponent } from './component/auth/change-password/change-password.component';
import { LayoutComponent as AppLayoutComponent } from './component/main/layout/layout.component';
import { DiscoverComponent } from './component/main/discover/discover.component';

export const routes: Routes = [
  { path: "", component: LandingPageComponent },
  { path:"auth", component: AuthLayoutComponent,
    children:[
      { path: "login", component: LoginFormComponent },
      { path: "register", component: RegisterFormComponent },
      { path: "forgot_pass", component: ForgotPasswordComponent },
      { path: "otp", component: OtpComponent },
      { path: "change_pass", component: ChangePasswordComponent }
    ]
   },
   { path: "main", component: AppLayoutComponent, 
      children: [
        { path: "discover" , component: DiscoverComponent}
      ]
   }
];
