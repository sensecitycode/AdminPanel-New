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
    userEditForm: FormGroup;
    roleList: [string];
    userServiceMsg:string;


    ngOnInit() {
        this.userEditForm = this.formBuilder.group({
            'name': ['',Validators.required],
            'surname': ['',Validators.required],
            'username': ['',Validators.required],
            'email': ['', [Validators.required,Validators.email]],
            'role_name': ['',Validators.required]
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
                        'role_name': this.user.role_name
                    })
                }
            }
        );

        this.usersServ.get_userDetails(this.originalUsername);


    }


    submitEditedUser() {
        let editedUser =
        {
          	'id': this.user._id,
          	'name': this.userEditForm.get('name').value,
          	'surname': this.userEditForm.get('surname').value,
          	'email': this.userEditForm.get('email').value,
          	'username': this.userEditForm.get('username').value,
          	'role_name':this.userEditForm.get('role_name').value,
          	'city': this.user.city
        };
        this.usersServ.edit_user(editedUser).subscribe(
          data => {console.log(data)},
          error => {
            console.log(error);
            if (error.error == "duplicate_surname") {
              this.userServiceMsg = 'duplicate_username';
              this.userEditForm.get('username').setErrors({usernameExists: true});
            }
            if (error.error == "duplicate_email") {
              this.userServiceMsg = 'duplicate_email';
              this.userEditForm.get('email').setErrors({emailExists: true});
            }
          },
          () => {
            this.userServiceMsg = 'success';
            this.originalUsername = editedUser.username;
          }
        )

    }

    onResetEdit() {
        this.userEditForm.setValue({
            'name':this.user.name,
            'surname':this.user.surname,
            'username':this.user.username,
            'email':this.user.email,
            'role_name':this.user.role_name
        })
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
