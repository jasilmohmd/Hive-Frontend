import { Routes } from '@angular/router';
import { LayoutComponent as AuthLayoutComponent } from './component/auth/layout/layout.component';
import { LoginFormComponent } from './component/auth/login-form/login-form.component';
import { RegisterFormComponent } from './component/auth/register-form/register-form.component';
import { LandingPageComponent } from './component/landing-page/landing-page.component';
import { OtpComponent } from './component/auth/otp/otp.component';
import { ChangePasswordComponent } from './component/auth/change-password/change-password.component';
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
];
