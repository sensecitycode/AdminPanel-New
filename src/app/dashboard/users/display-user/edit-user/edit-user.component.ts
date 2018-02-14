import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';


import { UsersService } from '../../users.service';


@Component({
    selector: 'app-edit-user',
    templateUrl: './edit-user.component.html',
    styleUrls: ['./edit-user.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class EditUserComponent implements OnInit {

    constructor(private formBuilder: FormBuilder, private usersServ: UsersService, private activatedRoute: ActivatedRoute) { }

    user:any;
    originalUsername:string;
    userEditForm: FormGroup;
    roleList: [string];
    userServiceMsg:string;


    ngOnInit() {
        this.userEditForm = this.formBuilder.group({
            'name': [''/*,Validators.required*/],
            'surname': [''/*,Validators.required*/],
            'username': ['',Validators.required],
            'email': ['', [Validators.required,Validators.email]],
            'role_name': ['',Validators.required],
            'position': ['',Validators.required]
        })

        this.originalUsername = this.activatedRoute.snapshot.url[0].path;
        this.roleList = ['cityAdmin','cityManager','departmentAdmin','departmentUser'];

        this.usersServ.get_userDetails(this.originalUsername)
        .subscribe(
            data => {this.user = data[0]},
            error => {console.log('error occured fetching user details'); this.userServiceMsg = 'services_error';},
            () => {
                this.userEditForm.setValue({
                    'name': this.user.name,
                    'surname': this.user.surname,
                    'username': this.user.username,
                    'email': this.user.email,
                    'role_name': this.user.role_name,
                    'position': this.user.position
                })
            }
        )
        ;


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
            'position':this.userEditForm.get('position').value,
            'city': this.user.city
        };
        this.usersServ.edit_user(editedUser).subscribe(
            data => {console.log(data)},
            error => {
                console.log(error);
                this.userEditForm.markAsPristine();
                if (error.error == "duplicate_username") {
                    this.userServiceMsg = 'duplicate_username';
                    this.userEditForm.get('username').setErrors({usernameExists: true});
                } else {
                    this.userServiceMsg ='services_error';
                }
            },
            () => {
                this.originalUsername = editedUser.username;
                this.userEditForm.markAsPristine();
                this.userServiceMsg = 'success';
            }
        )

    }

    onResetEdit() {
        this.userEditForm.setValue({
            'name':this.user.name,
            'surname':this.user.surname,
            'username':this.user.username,
            'email':this.user.email,
            'role_name':this.user.role_name,
            'position': this.user.position
        })
        this.userServiceMsg = '';
    }

}
