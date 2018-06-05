import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { LOCALE_ID } from '@angular/core';

import { registerLocaleData } from '@angular/common';
import localeEl from '@angular/common/locales/el'

import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletMarkerClusterModule } from '@asymmetrik/ngx-leaflet-markercluster';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslationService } from './shared/translation.service';
// import { UsersService } from './dashboard/users/users.service';
// import { DepartmentsService } from './dashboard/departments/departments.service';
import { AgGridModule } from 'ag-grid-angular/main';
import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressHttpModule } from '@ngx-progressbar/http';

import { ToastrModule } from 'ngx-toastr';

import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { LightboxModule } from 'angular2-lightbox'

import { MatFormFieldModule,
         MatInputModule,
         MatToolbarModule,
         MatIconModule,
         MatCheckboxModule,
         MatButtonModule,
         MatStepperModule,
         MatExpansionModule,
         MatMenuModule,
         MatSelectModule,
         MatCardModule,
         MatProgressSpinnerModule,
         MatDialogModule,
         MatRadioModule,
         MatTooltipModule,
         MatButtonToggleModule} from '@angular/material';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { AppBootStrapComponent } from './app-bootstrap.component';
import { HeaderComponent } from './header/header.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { SignupComponent } from './signup/signup.component';
import { PersonalInfoComponent } from './signup/personal-info/personal-info.component';
import { MapLinkComponent } from './signup/map-link/map-link.component';
import { AccountCreateComponent } from './signup/account-create/account-create.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SidebarComponent } from './dashboard/sidebar/sidebar.component';
import { BoundariesComponent } from './dashboard/boundaries/boundaries.component';
import { DepartmentsComponent } from './dashboard/departments/departments.component';
import { UsersComponent } from './dashboard/users/users.component';
import { PolicyComponent } from './dashboard/policy/policy.component';
import { HomeComponent } from './dashboard/home/home.component';
import { EditRendererComponent } from './dashboard/users/edit-renderer.component';
import { DialogsComponent } from './shared/dialogs/dialogs.component';
import { DisplayUserComponent } from './dashboard/users/display-user/display-user.component';
import { EditUserComponent } from './dashboard/users/display-user/edit-user/edit-user.component';
import { AddUserComponent } from './dashboard/users/add-user/add-user.component';
import { ListUsersComponent } from './dashboard/users/list-users/list-users.component';
import { AccountComponent } from './dashboard/account/account.component';
import { ListDepartmentsComponent } from './dashboard/departments/list-departments/list-departments.component';
import { AddDepartmentComponent } from './dashboard/departments/add-department/add-department.component';
import { depEditRendererComponent } from './dashboard/departments/list-departments/dep-edit-renderer.component';
import { DisplayDepartmentComponent } from './dashboard/departments/display-department/display-department.component';
import { EditDepartmentComponent } from './dashboard/departments/display-department/edit-department/edit-department.component';
import { IssuesComponent } from './dashboard/issues/issues.component';
import { ListIssuesComponent } from './dashboard/issues/list-issues/list-issues.component';
import { DisplayIssueComponent } from './dashboard/issues/display-issue/display-issue.component';
import { StatisticsComponent } from './dashboard/statistics/statistics.component';
import { SearchIssueComponent } from './dashboard/issues/search-issue/search-issue.component';



export function HttpLoaderFactory(httpclient:HttpClient) {
    return new TranslateHttpLoader(httpclient, './assets/i18n/', '.json');
}
registerLocaleData(localeEl);

@NgModule({
    declarations: [
        AppComponent,
        AppBootStrapComponent,
        HeaderComponent,
        WelcomeComponent,
        SignupComponent,
        PersonalInfoComponent,
        MapLinkComponent,
        AccountCreateComponent,
        LoginComponent,
        DashboardComponent,
        SidebarComponent,
        BoundariesComponent,
        DepartmentsComponent,
        UsersComponent,
        PolicyComponent,
        HomeComponent,
        EditRendererComponent,
        DialogsComponent,
        DisplayUserComponent,
        EditUserComponent,
        AddUserComponent,
        ListUsersComponent,
        AccountComponent,
        ListDepartmentsComponent,
        AddDepartmentComponent,
        depEditRendererComponent,
        DisplayDepartmentComponent,
        EditDepartmentComponent,
        IssuesComponent,
        ListIssuesComponent,
        DisplayIssueComponent,
        StatisticsComponent,
        SearchIssueComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        AppRoutingModule,
        MatFormFieldModule,
        MatInputModule,
        MatToolbarModule,
        MatIconModule,
        MatCheckboxModule,
        MatButtonModule,
        MatStepperModule,
        MatExpansionModule,
        MatMenuModule,
        MatSelectModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatRadioModule,
        MatTooltipModule,
        MatButtonToggleModule,
        MatSlideToggleModule,
        LeafletModule,
        LeafletMarkerClusterModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        AgGridModule.withComponents([EditRendererComponent, DialogsComponent, depEditRendererComponent]),
        NgProgressModule.forRoot(),
        NgProgressHttpModule,
        CommonModule,
        ToastrModule.forRoot({preventDuplicates: true}),
        MDBBootstrapModule.forRoot(),
        LightboxModule
    ],
    schemas: [ NO_ERRORS_SCHEMA ],
    providers: [TranslationService, {provide: LOCALE_ID, deps:[TranslationService], useFactory: (TranslationService) => TranslationService.getLanguage()}],
    bootstrap: [AppComponent]
})


export class AppModule { }
