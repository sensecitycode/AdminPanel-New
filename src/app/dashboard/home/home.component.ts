import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { UsersService } from '../users/users.service';
import { DepartmentsService } from '../departments/departments.service';

import { Subscription } from 'rxjs/Subscription';



@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {

    constructor(private usersServ: UsersService, private depServ: DepartmentsService) { }

    users = [];
    departments = [];
    subscription = new Subscription;
    ngOnInit() {
        this.subscription.add(this.usersServ.usersChanged.subscribe(
            (status:string) => {
                if (status == "userArrayPopulated"){
                    console.log("status == userArrayPopulated");
                    this.users = this.usersServ.return_userArray();
                }
            }
        ));
        this.usersServ.populate_userArray();

        this.subscription.add(this.depServ.departmentsChanged.subscribe(
            (status:string) => {
                if (status == "departmentsArrayPopulated"){
                    console.log("status == departmentsArrayPopulated");
                    this.departments = this.depServ.return_departmentsArray();
                    console.log(this.departments);
                }
            }
        ));
        this.depServ.populate_departmentsArray();

    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
