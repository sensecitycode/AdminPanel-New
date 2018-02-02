import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';



import { UsersService } from '../users.service';


@Component({
    selector: 'app-display-user',
    templateUrl: './display-user.component.html',
    styleUrls: ['./display-user.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class DisplayUserComponent implements OnInit {

    constructor(private usersServ: UsersService, private activatedRoute: ActivatedRoute) { }

    subscription: Subscription;
    user:object;

    ngOnInit() {

        let username = this.activatedRoute.snapshot.url[0].path;
        this.subscription = this.usersServ.usersChanged.subscribe(
            (status:string) => {
                if (status == "userDetailsFetched"){
                    console.log(`status == ${status}`);
                    this.user = this.usersServ.return_userDetails();
                }
            }
        );

        this.usersServ.get_userDetails(username);



    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
