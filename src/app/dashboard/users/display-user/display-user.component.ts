import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


import { TranslationService } from '../../../shared/translation.service';
import { UsersService } from '../users.service';


@Component({
    selector: 'app-display-user',
    templateUrl: './display-user.component.html',
    styleUrls: ['./display-user.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class DisplayUserComponent implements OnInit {

    constructor(private usersServ: UsersService, private activatedRoute: ActivatedRoute, private translationService:TranslationService, private toastr: ToastrService) { }

    username:string;
    user:any = {};
    // userServiceMsg:string;

    ngOnInit() {

        this.username = this.activatedRoute.snapshot.url[0].path;
        this.usersServ.get_userDetails(this.username)
            .subscribe(
                data => {this.user = data[0]},
                error => {this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})},
                () => {}
            )
    }
}
