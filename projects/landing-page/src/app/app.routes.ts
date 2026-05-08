import { Routes } from '@angular/router';
import { NotFoundPage } from 'invite-ui';
import { LandingPage } from './pages/landing-page/landing-page';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: '**', component: NotFoundPage },
];
