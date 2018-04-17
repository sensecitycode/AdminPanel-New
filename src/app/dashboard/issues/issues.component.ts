import { Component, OnInit, ViewEncapsulation} from '@angular/core';


@Component({
    selector: 'app-issues',
    templateUrl: './issues.component.html',
    styleUrls: ['./issues.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class IssuesComponent implements OnInit {

    constructor() { }


    ngOnInit() {
        // this.depServ.populate_departmentsArray()
    }
}
