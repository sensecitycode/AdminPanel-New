import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { UsersService } from './users/users.service';
import { DepartmentsService } from './departments/departments.service';
import { TranslationService } from '../shared/translation.service';
import { MatMenuTrigger } from '@angular/material/menu';
// import { AuthService } from '../auth/auth.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    encapsulation: ViewEncapsulation.None,
    providers: [ UsersService, DepartmentsService ]
})

export class DashboardComponent implements OnInit {
    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

    constructor(private translationService: TranslationService, private usersServ: UsersService, private depServ: DepartmentsService ) { }

    // onLangMenuTrigger() {
    //   this.trigger.openMenu();
    // }


    role:string = sessionStorage.getItem('role');
    uuid:string = sessionStorage.getItem('uuid');
    city:string = sessionStorage.getItem('city');
    username:string = sessionStorage.getItem('username');
    currentLang:string = 'el';
    subscription = new Subscription;
    ngOnInit() {
        this.usersServ.role = this.role;
        this.usersServ.uuid = this.uuid;
        this.usersServ.city = this.city;
        this.depServ.role = this.role;
        this.depServ.uuid = this.uuid;
        this.depServ.city = this.city;

        this.subscription.add(this.usersServ.usersChanged.subscribe(
            (status:string) => {console.log("usersChanged: " + status);}
        ));
        this.subscription.add(this.depServ.departmentsChanged.subscribe(
            (status:string) => {console.log(`usersChanged: ${status}`)}
        ));
        // this.usersServ.populate_userArray();
        // this.usersServ.get_userRoles();
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
