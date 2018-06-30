import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute } from '@angular/router';

import { UsersService } from './users/users.service';
import { DepartmentsService } from './departments/departments.service';
import { TranslationService } from '../shared/translation.service';
import { MunicipalityService } from "./municipality.service";
import { IssuesService } from './issues/issues.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { AuthService } from '../auth/auth.service';
import { AppBootStrapComponent } from '../../app/app-bootstrap.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    encapsulation: ViewEncapsulation.None,
    providers: [ UsersService, DepartmentsService, IssuesService, MunicipalityService ]
})

export class DashboardComponent implements OnInit {
    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

    constructor(private router: Router,
        private activatedRoute: ActivatedRoute,
        private translationService: TranslationService,
        private usersServ: UsersService,
        private depServ: DepartmentsService,
        public authService: AuthService,
        private bootstrapComp : AppBootStrapComponent,
        private issuesService: IssuesService,
        private municService: MunicipalityService) { }

    // onLangMenuTrigger() {
    //   this.trigger.openMenu();
    // }


    role:string = sessionStorage.getItem('role');
    uuid:string = sessionStorage.getItem('uuid');
    city:string = sessionStorage.getItem('city');
    email:string = sessionStorage.getItem('email');
    position:string = sessionStorage.getItem('position');
    username:string = sessionStorage.getItem('username');
    departments:string = sessionStorage.getItem('departments');
    currentLang:string = this.translationService.getLanguage();
    subscription = new Subscription;
    ngOnInit() {
        this.usersServ.role = this.role;
        this.usersServ.uuid = this.uuid;
        this.usersServ.city = this.city;
        this.usersServ.email = this.email;
        this.usersServ.position = this.position;
        this.usersServ.username = this.username;
        this.usersServ.API = this.bootstrapComp.API;
        this.depServ.role = this.role;
        this.depServ.uuid = this.uuid;
        this.depServ.city = this.city;
        this.depServ.API = this.bootstrapComp.API;
        this.issuesService.role = this.role;
        this.issuesService.uuid = this.uuid;
        this.issuesService.city = this.city;
        if (this.departments != '') {
            this.issuesService.departments_ids = this.departments.split(',');
        }
        this.issuesService.API = this.bootstrapComp.API;
        this.issuesService.statisticsUrl = this.bootstrapComp.STATISTICS_URL;
        this.issuesService.googleKey =  this.bootstrapComp.GOOGLE_KEY;
        this.issuesService.cityCenter = this.bootstrapComp.CITY_CENTERS[this.city]
        this.municService.API = this.bootstrapComp.API
        this.municService.city = this.city
        this.municService.uuid = this.uuid


        this.subscription.add(this.usersServ.usersChanged.subscribe(
        ));
        this.subscription.add(this.depServ.departmentsChanged.subscribe(
        ));
        // this.usersServ.populate_userArray();
        // this.usersServ.get_userRoles();
        // this.router.navigate(['home'], {relativeTo: this.activatedRoute});
    }

    langToEl() {
        this.translationService.switchLanguage("el");
        this.currentLang = 'el';
    }

    langToEn() {
        this.translationService.switchLanguage("en");
        this.currentLang = 'en';
    }

    //sidebar_listener
    toggled = false;
    isToggled(){
        this.toggled = !this.toggled;
    }

    ngOnDestroy() {
      this.subscription.unsubscribe();
    }
}
