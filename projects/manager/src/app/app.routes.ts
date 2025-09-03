import { Routes } from '@angular/router';
import { InsertTheme } from './pages/insert-theme/insert-theme';

export const routes: Routes = [
  { path: '', redirectTo: '\manager', pathMatch: 'full' },
  { path: 'manager', component: InsertTheme },
];
