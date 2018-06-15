import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { UsersService } from '../users/users.service';
import { DepartmentsService } from '../departments/departments.service';
import { IssuesService } from '../issues/issues.service'

import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { TranslationService } from '../../shared/translation.service';




@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class HomeComponent implements OnInit {

    constructor(private usersServ: UsersService, private depServ: DepartmentsService, private issuesService:IssuesService, private toastr: ToastrService, private translationService: TranslationService,) { }

    users = [];
    departments = [];
    resolvedIssues = []
    subscription = new Subscription;
    ngOnInit() {
        this.subscription.add(this.usersServ.usersChanged.subscribe(
            (status:string) => {
                if (status == "userArrayPopulated"){
                    this.users = this.usersServ.return_userArray();
                }
            }
        ));
        this.usersServ.populate_userArray();

        this.subscription.add(this.depServ.departmentsChanged.subscribe(
            (status:string) => {
                if (status == "departmentsArrayPopulated"){
                    this.departments = this.depServ.return_departmentsArray();
                }
            }
        ));
        this.depServ.populate_departmentsArray();

        let resolvedIssues_obj = {
            status: 'RESOLVED',
            startdate: moment(new Date()).subtract(30, 'days').format("YYYY-MM-DD"),
            enddate: moment(new Date()).format("YYYY-MM-DD"),
        }
        this.issuesService.fetch_issues(resolvedIssues_obj)
        .subscribe(
            data => this.resolvedIssues = data,
            error => this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true}),
        )
    }


    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
