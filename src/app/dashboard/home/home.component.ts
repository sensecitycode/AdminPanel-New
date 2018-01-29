import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { UsersService } from '../users/users.service';
import { Subscription } from 'rxjs/Subscription';



@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {

    constructor(private usersServ: UsersService) { }

    users =[];
    departments =[];
    subscription: Subscription;
    ngOnInit() {
        this.subscription = this.usersServ.usersChanged.subscribe(
            (status:string) => {
                if (status == "userArrayPopulated"){
                    console.log("status == userArrayPopulated");
                    this.users = this.usersServ.return_userArray();
                }
            });
        this.usersServ.populate_userArray();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
