import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { interval } from 'rxjs/observable/interval'

import { DepartmentsService } from '../departments.service';
import { UsersService } from '../../users/users.service';

@Component({
    selector: 'app-display-department',
    templateUrl: './display-department.component.html',
    styleUrls: ['./display-department.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class DisplayDepartmentComponent implements OnInit {

    constructor(private depServ:DepartmentsService, private usersServ:UsersService, private activatedRoute:ActivatedRoute) { }

    departments = this.depServ.return_departmentsArray
    subscription = new Subscription()
    department:any = {}

    ngOnInit() {
        let dep_id = this.activatedRoute.snapshot.url[0].path;
        if (this.depServ.return_departmentsArray().length == 0) {
            this.subscription = this.depServ.departmentsChanged.subscribe(
              (status:string) => {
                if (status == "departmentsArrayPopulated"){
                  let department = this.depServ.return_departmentsArray().find(idx => {return idx.departmentID == dep_id});
                  this.department = {
                    name:department.component_name,
                    issueAdmins:department.cp_access,
                    manager:department.default_assigned_email[0],
                    ccList:department.default_cc_list
                  }
                }
              }
            )
            this.depServ.populate_departmentsArray()
        } else {
          let department = this.depServ.return_departmentsArray().find(idx => {return idx.departmentID == dep_id});
          this.department = {
              name:department.component_name,
              issueAdmins:department.cp_access,
              manager:department.default_assigned_email[0],
              ccList:department.default_cc_list
          }
        }

    }

    ngOnDestroy() {
      this.subscription.unsubscribe()
    }

}
