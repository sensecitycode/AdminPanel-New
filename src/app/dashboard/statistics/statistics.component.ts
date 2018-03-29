import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { IssuesService } from '../issues/issues.service';


@Component({
    selector: 'app-statistics',
    templateUrl: './statistics.component.html',
    styleUrls: ['./statistics.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class StatisticsComponent implements OnInit {

    constructor(private router: Router, private issuesService: IssuesService) { }

    city:string
    statisticsUrl:string
    ngOnInit() {
        this.city = this.issuesService.city
        this.statisticsUrl = this.issuesService.statisticsUrl
    }

}
