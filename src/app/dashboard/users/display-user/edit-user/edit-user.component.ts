import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { TranslationService } from '../../../../shared/translation.service';

import { UsersService } from '../../users.service';

// const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

@Component({
    selector: 'app-edit-user',
    templateUrl: './edit-user.component.html',
    styleUrls: ['./edit-user.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class EditUserComponent implements OnInit {

    constructor(private formBuilder: FormBuilder, private usersServ: UsersService, private router:Router, private activatedRoute: ActivatedRoute, private translationService:TranslationService, private toastr: ToastrService) { }

    user:any;
    originalUsername:string;
    userEditForm: FormGroup;
    roleList: [string];
    // userServiceMsg:string;


    ngOnInit() {
        this.userEditForm = this.formBuilder.group({
            'name': [''/*,Validators.required*/],
            'passwordForm': this.formBuilder.group({
                'pw1':[''],
                'pw2':['']
            }, {validator: this.noMatchingPassword} ),
            'surname': [''/*,Validators.required*/],
            'username': ['',Validators.required],
            'email': [''/*, [Validators.required,Validators.pattern(EMAIL_REGEX)]*/],
            'role_name': ['',Validators.required],
            'position': ['',Validators.required]
        })

        this.originalUsername = this.activatedRoute.snapshot.url[0].path;
        this.roleList = ['cityAdmin','cityManager','departmentAdmin','departmentUser'];

        this.usersServ.get_userDetails(this.originalUsername)
        .subscribe(
            data => {this.user = data[0]},
            error => {this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})},
            () => {
                this.userEditForm.setValue({
                    'name': this.user.name,
                    'passwordForm':{
                        'pw1':'',
                        'pw2':''
                    },
                    'surname': this.user.surname,
                    'username': this.user.username,
                    'email': this.user.email,
                    'role_name': this.user.role_name,
                    'position': this.user.position
                })
            }
        )
    }
    noMatchingPassword(AC: AbstractControl) {
        let pass = AC.get('pw1');
        let confirmPass = AC.get('pw2');

        if (pass.value != confirmPass.value) {
            confirmPass.setErrors({noMatchingPassword: true});
        } else {
            confirmPass.setErrors(null);
            return null
        }
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
            'city': this.user.city,
            'password':this.userEditForm.get('passwordForm').get('pw1').value
        };
        this.usersServ.edit_user(editedUser).subscribe(
            data => {},
            error => {
                // this.userEditForm.markAsPristine();
                if (error.error == "duplicate_username") {
                    // this.userServiceMsg = 'duplicate_username';
                    let usernameObj = {username:this.userEditForm.get('username').value};
                    this.toastr.error(this.translationService.get_instant('DASHBOARD.USERNAME_EXISTS_MSG', usernameObj), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                    this.userEditForm.get('username').setErrors({usernameExists: true});
                } else {
                    // this.userServiceMsg ='services_error';
                    this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                }
            },
            () => {
                // this.originalUsername = editedUser.username;
                let usernameObj = {username:this.originalUsername};
                this.toastr.success(this.translationService.get_instant('DASHBOARD.USER_EDIT_MSG', usernameObj), this.translationService.get_instant('SUCCESS'), {timeOut:8000, progressBar:true, enableHtml:true})
                this.router.navigate(['../../'], {relativeTo:this.activatedRoute})
                // this.userEditForm.markAsPristine();
                // this.userServiceMsg = 'success';
            }
        )

    }

    onResetEdit() {
        this.userEditForm.setValue({
            'name':this.user.name,
            'passwordForm':{
                'pw1':'',
                'pw2':''
            },
            'surname':this.user.surname,
            'username':this.user.username,
            'email':this.user.email,
            'role_name':this.user.role_name,
            'position': this.user.position
        })
        this.userEditForm.get('passwordForm').get('pw1').markAsUntouched()
        this.userEditForm.get('passwordForm').get('pw2').markAsUntouched()

        // this.userServiceMsg = '';
    }

}
