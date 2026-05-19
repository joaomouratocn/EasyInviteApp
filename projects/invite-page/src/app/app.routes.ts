import { Routes } from '@angular/router';
import { environment } from 'shared-config';
import { InviteLabel, LIB_CONFIG, NotFoundPage } from 'invite-ui';

export const routes: Routes = [
  {
    path: ':received',
    component: InviteLabel,
    providers: [{ provide: LIB_CONFIG, useValue: environment }],
  },
  { path: '**', component: NotFoundPage },
];
