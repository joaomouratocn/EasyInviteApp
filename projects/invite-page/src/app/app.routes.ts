import { Routes } from '@angular/router';
import { InviteLabel, NotFoundPage } from 'invite-ui';

export const routes: Routes = [
  { path: ':received', component: InviteLabel },
  { path: '**', component: NotFoundPage },
];
