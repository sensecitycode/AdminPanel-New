import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
@Component({
    selector: 'app-bootstrap',
    template: '<router-outlet></router-outlet>',
})

export class AppBootStrapComponent implements OnInit{

    constructor(private route: ActivatedRoute) {}

    public API:string
    ngOnInit() {
        this.API = this.route.snapshot.data['envSpecific'].API;
    }
}
