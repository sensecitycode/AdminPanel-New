import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslationService } from './shared/translation.service';
import { UsersService } from './dashboard/users/users.service';
import { AgGridModule } from 'ag-grid-angular/main';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
         MatDialogModule } from '@angular/material';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
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


export function HttpLoaderFactory(httpclient:HttpClient) {
    return new TranslateHttpLoader(httpclient, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
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
        MatDialogModule,
        LeafletModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        AgGridModule.withComponents([EditRendererComponent, DialogsComponent])
    ],
    providers: [TranslationService,UsersService],
    bootstrap: [AppComponent]
})
export class AppModule { }
