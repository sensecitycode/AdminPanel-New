import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';

import { UsersService } from '../../users.service';


@Component({
    selector: 'app-edit-user',
    templateUrl: './edit-user.component.html',
    styleUrls: ['./edit-user.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class EditUserComponent implements OnInit {

    constructor(private formBuilder: FormBuilder, private usersServ: UsersService, private activatedRoute: ActivatedRoute) { }

    subscription: Subscription;
    user:any;
    originalUsername:string;
    originalValuesForm: any;
    userEditForm: FormGroup;
    roleList: [string];


    ngOnInit() {
        this.userEditForm = this.formBuilder.group({
            'name': ['',Validators.required],
            'surname': ['',Validators.required],
            'username': ['',Validators.required],
            'email': ['', [Validators.required,Validators.email]],
            'roles': ['',Validators.required]
        })

        this.originalUsername = this.activatedRoute.snapshot.url[0].path;
        this.roleList = ['cityAdmin','cityManager','departmentAdmin','departmentUser'];
        this.subscription = this.usersServ.usersChanged.subscribe(
            (status:string) => {
                if (status == "userDetailsFetched"){
                    console.log(`status == ${status}`);
                    this.user = this.usersServ.return_userDetails();
                    this.userEditForm.setValue({
                        'name': this.user.name,
                        'surname': this.user.surname,
                        'username': this.user.username,
                        'email': this.user.email,
                        'roles': this.user.role_name
                    })
                    this.originalValuesForm = this.userEditForm.value;
                    console.log(this.originalValuesForm.username);

                }
            }
        );

        this.usersServ.get_userDetails(this.originalUsername);


    }


    submitEditedUser() {
        console.log(this.userEditForm);

    }

    onResetEdit() {
        console.log(this.userEditForm);
        this.userEditForm.setValue({
            'name':this.user.name,
            'surname':this.user.surname,
            'username':this.user.username,
            'email':this.user.email,
            'roles':this.user.role_name
        })
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
