import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppBootStrapComponent } from './app-bootstrap.component';
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
import { ListDepartmentsComponent } from './dashboard/departments/list-departments/list-departments.component';
import { AddDepartmentComponent } from './dashboard/departments/add-department/add-department.component';
import { DisplayDepartmentComponent } from './dashboard/departments/display-department/display-department.component';
import { EditDepartmentComponent } from './dashboard/departments/display-department/edit-department/edit-department.component';
import { IssuesComponent } from './dashboard/issues/issues.component';
import { ListIssuesComponent } from './dashboard/issues/list-issues/list-issues.component';
import { DisplayIssueComponent } from './dashboard/issues/display-issue/display-issue.component';
import { SearchIssueComponent } from './dashboard/issues/search-issue/search-issue.component';
import { StatisticsComponent } from './dashboard/statistics/statistics.component';


import { AuthService } from './auth/auth.service';
import { AuthGuardService } from './guards/auth-guard.service';
import { RoleGuardService } from './guards/role-guard.service';
import { EnvironmentSpecificResolver } from './envSpecific/environment-specific-resolver';
import { EnvironmentSpecificService } from './envSpecific/environment-specific-service';

const appRoutes: Routes = [
    { path: '', component: AppBootStrapComponent, resolve: { envSpecific: EnvironmentSpecificResolver }, children:[
        { path: 'welcome', component: WelcomeComponent},
        { path: 'signup', component: SignupComponent},
        { path: 'login', component: LoginComponent},
        { path: 'dashboard', component: DashboardComponent, canActivate:[AuthGuardService], children:[
            {path: 'home',  canActivate:[RoleGuardService], component: HomeComponent},
            {path: 'users', component: UsersComponent, children:[
                {path: '', component: ListUsersComponent},
                {path: 'add', component: AddUserComponent},
                {path: ':name', component: DisplayUserComponent},
                {path: ':name/edit', component: EditUserComponent}
            ]},
            {path: 'departments', component: DepartmentsComponent, children:[
                {path: '', component: ListDepartmentsComponent},
                {path: 'add', component: AddDepartmentComponent},
                {path: ':name', component: DisplayDepartmentComponent},
                {path: ':name/edit', component: EditDepartmentComponent}
            ]},
            {path: 'boundaries', component: BoundariesComponent},
            {path: 'policy', component: PolicyComponent},
            {path: 'account', component: AccountComponent},
            {path: 'issues', component: IssuesComponent, children:[
                {path: '', component: ListIssuesComponent},
                {path: ':name', component: DisplayIssueComponent}
            ]},

            {path: 'search_issues', component: SearchIssueComponent},
            {path: 'statistics', component: StatisticsComponent},
            {path: '**', redirectTo: 'home', pathMatch: 'full'}
        ]},
        { path: '**', redirectTo: 'welcome', pathMatch: 'full'}
    ]}
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule],
    providers: [AuthService, AuthGuardService, RoleGuardService, EnvironmentSpecificResolver, EnvironmentSpecificService]
})
export class AppRoutingModule {
}
