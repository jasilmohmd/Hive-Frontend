import { Routes } from '@angular/router';
import { LayoutComponent } from './component/auth/layout/layout.component';
import { LoginFormComponent } from './component/auth/login-form/login-form.component';
import { RegisterFormComponent } from './component/auth/register-form/register-form.component';
import { LandingPageComponent } from './component/landing-page/landing-page.component';

export const routes: Routes = [
  { path: "", component: LandingPageComponent },
  { path:"auth", component: LayoutComponent,
    children:[
      { path: "login", component: LoginFormComponent },
      { path: "register", component: RegisterFormComponent }
    ]
   },
];
