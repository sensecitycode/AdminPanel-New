import { Component, OnInit, ViewEncapsulation} from '@angular/core';

import { DepartmentsService } from '../departments/departments.service';

@Component({
    selector: 'app-issues',
    templateUrl: './issues.component.html',
    styleUrls: ['./issues.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class IssuesComponent implements OnInit {

    constructor(private depServ: DepartmentsService) { }


    ngOnInit() {
        this.depServ.populate_departmentsArray()
    }
}
