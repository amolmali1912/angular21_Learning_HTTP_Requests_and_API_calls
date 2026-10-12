import { Routes } from '@angular/router';
import { UsersComponent } from './features/users/users';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: 'users',
    component: UsersComponent,
  },
];
