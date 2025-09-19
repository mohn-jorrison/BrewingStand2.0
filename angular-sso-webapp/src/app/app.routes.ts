import { Routes } from '@angular/router';
import { SignInComponent } from './components/auth/sign-in/sign-in.component';
import { AuthCallbackComponent } from './components/auth/callback/auth-callback.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard, GuestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    component: SignInComponent,
    canActivate: [GuestGuard]
  },
  { 
    path: 'auth/signin', 
    component: SignInComponent,
    canActivate: [GuestGuard]
  },
  { 
    path: 'auth/callback', 
    component: AuthCallbackComponent 
  },
  { 
    path: 'login', 
    component: SignInComponent,
    canActivate: [GuestGuard]
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'unauthorized', 
    component: SignInComponent, // Could create a dedicated unauthorized component
    data: { message: 'You do not have permission to access this resource.' }
  },
  { path: '**', redirectTo: 'auth/signin' }
];
