import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from './auth/auth.service';
@Component({
    selector: 'app-bootstrap',
    template: '<router-outlet></router-outlet>',
})

export class AppBootStrapComponent implements OnInit{

    constructor(private route: ActivatedRoute, private authService: AuthService) {}

    public API:string
    public STATISTICS_URL:string;
    public GOOGLE_KEY:string;
    ngOnInit() {
        this.API = this.route.snapshot.data['envSpecific'].API;
        this.STATISTICS_URL = this.route.snapshot.data['envSpecific'].TEMP_STATISTICS;
        this.GOOGLE_KEY = this.route.snapshot.data['envSpecific'].GOOGLE_KEY;
        this.authService.API = this.API
    }
}
