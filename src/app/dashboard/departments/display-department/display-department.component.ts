import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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

    department:any = {};

    ngOnInit() {

        let dep_id = this.activatedRoute.snapshot.url[0].path;
        let department = this.depServ.return_departmentsArray().find(idx => {return idx.departmentID == dep_id});
        if (department)
            this.department = {
                name:department.component_name,
                issueAdmins:department.cp_access,
                manager:department.default_assigned_email[0],
                ccList:department.default_cc_list
            }
    }

}
