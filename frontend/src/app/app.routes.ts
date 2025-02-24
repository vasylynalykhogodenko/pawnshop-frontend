import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { ClientAddComponent } from './components/client/client-add/client-add.component';
import { ClientListComponent } from '../app/components/client/client-list/client-list.component';
import { ClientEditComponent } from './components/client/client-edit/client-edit.component';
import { PawnTransactionListComponent } from './components/pawn-transaction/pawn-transaction-list/pawn-transaction-list.component';
import { PawnTransactionAddComponent } from './components/pawn-transaction/pawn-transaction-add/pawn-transaction-add.component';
import { PawnTransactionEditComponent } from './components/pawn-transaction/pawn-transaction-edit/pawn-transaction-edit.component';
import { ItemCategoryListComponent } from './components/item-category/item-category-list/item-category-list.component';
import { ItemCategoryAddComponent } from './components/item-category/item-category-add/item-category-add.component';
import { ItemCategoryEditComponent } from './components/item-category/item-category-edit/item-category-edit.component';

export const routes: Routes = [
  { path: 'signin', component: SignInComponent },
  { path: 'login', component: LogInComponent },
  { 
    path: 'client',
    canActivate: [AuthGuard], 
    children: [
      { path: '', component: ClientListComponent },
      { path: 'add', component: ClientAddComponent },
      { path: 'edit/:id', component: ClientEditComponent },
    ]
  },
  {
    path: 'pawnTransaction',
    canActivate: [AuthGuard], 
    children: [
      { path: '', component: PawnTransactionListComponent },
      { path: 'add', component: PawnTransactionAddComponent },
      { path: 'edit/:id', component: PawnTransactionEditComponent },
    ]
  },
  { 
    path: 'itemCategory',
    canActivate: [AuthGuard], 
    children: [
      { path: '', component: ItemCategoryListComponent },
      { path: 'add', component: ItemCategoryAddComponent },
      { path: 'edit/:id', component: ItemCategoryEditComponent },
    ]
  },
];