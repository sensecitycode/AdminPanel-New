import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';



import { UsersService } from '../users.service';


@Component({
    selector: 'app-display-user',
    templateUrl: './display-user.component.html',
    styleUrls: ['./display-user.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class DisplayUserComponent implements OnInit {

    constructor(private usersServ: UsersService, private activatedRoute: ActivatedRoute) { }

    username:string;
    user:object;
    userServiceMsg:string;

    ngOnInit() {

        this.username = this.activatedRoute.snapshot.url[0].path;
        console.log(this.username);
        this.usersServ.get_userDetails(this.username)
            .subscribe(
                data => {this.user = data[0]},
                error => {console.log('error occured fetching user details'); this.userServiceMsg = 'error';},
                () => {}
            )
    }
}
