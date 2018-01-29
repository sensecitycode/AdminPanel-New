import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WelcomeComponent } from './welcome/welcome.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './dashboard/home/home.component'
import { UsersComponent} from './dashboard/users/users.component';
import { ListUsersComponent } from './dashboard/users/list-users/list-users.component';
import { DisplayUserComponent } from './dashboard/users/display-user/display-user.component';
import { EditUserComponent } from './dashboard/users/display-user/edit-user/edit-user.component';
import { AddUserComponent } from './dashboard/users/add-user/add-user.component';
import { DepartmentsComponent } from './dashboard/departments/departments.component';
import { BoundariesComponent } from './dashboard/boundaries/boundaries.component';
import { PolicyComponent } from './dashboard/policy/policy.component';
import { AccountComponent } from './dashboard/account/account.component';

import { AuthService } from './auth/auth.service';
import { AuthGuardService } from './guards/auth-guard.service';

const appRoutes: Routes = [
    { path: 'welcome', component: WelcomeComponent},
    { path: 'signup', component: SignupComponent},
    { path: 'login', component: LoginComponent},
    { path: 'dashboard', component: DashboardComponent, canActivate:[AuthGuardService], children:[
        {path: 'home', component: HomeComponent},
        {path: 'users', component: UsersComponent, children:[
            {path: '', component: ListUsersComponent},
            {path: 'add', component: AddUserComponent},
            {path: ':name', component: DisplayUserComponent},
            {path: ':name/edit', component: EditUserComponent}
        ]},
        {path: 'departments', component: DepartmentsComponent},
        {path: 'boundaries', component: BoundariesComponent},
        {path: 'policy', component: PolicyComponent},
        {path: 'account', component: AccountComponent},
        {path: '**', redirectTo: 'home', pathMatch: 'full'}
    ]},
    { path: '**', redirectTo: 'welcome', pathMatch: 'full'}

];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule],
    providers: [AuthService, AuthGuardService]
})
export class AppRoutingModule {
}
