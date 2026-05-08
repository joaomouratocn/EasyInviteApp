import { Routes } from '@angular/router';
import { EditForm } from './pages/edit-form/edit-form';
import { ThemeGallery } from './pages/theme-gallery/theme-gallery';
import { NotFoundPage } from 'invite-ui';
import { LoginPage } from './pages/login-page/login-page';
import { Dashboard } from './pages/dashboard/dashboard';
import { AuthGuardLogged } from './core/auth-guard-login';
import { AuthGuardLogout } from './core/auth-guard-logout';
import { ConfirmedList } from './pages/confirmed-list/confirmed-list';
import { Register } from './pages/register/register';
import { ForgotPassword } from './pages/forgot-password/forgot-password';

export const routes: Routes = [
  { path: '', redirectTo: '\login', pathMatch: 'full' },
  { path: 'register', component: Register },
  { path: 'edit/:id', component: EditForm },
  { path: 'gallery', component: ThemeGallery },
  { path: 'forgot', component: ForgotPassword },
  { path: 'confirmed/:id', component: ConfirmedList, canActivate: [AuthGuardLogged] },
  { path: 'login', component: LoginPage, canActivate: [AuthGuardLogout] },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuardLogged] },
  { path: '**', component: NotFoundPage },
];
