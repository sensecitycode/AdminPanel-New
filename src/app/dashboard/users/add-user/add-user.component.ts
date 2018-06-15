import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';

import { UsersService } from '../users.service';
import { TranslationService } from '../../../shared/translation.service';
import { ToastrService } from 'ngx-toastr';


const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

@Component({
    selector: 'app-add-user',
    templateUrl: './add-user.component.html',
    styleUrls: ['./add-user.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class AddUserComponent implements OnInit {

    constructor(private formBuilder: FormBuilder, private usersServ: UsersService, private translationService:TranslationService, private toastr: ToastrService) { }

    userAddForm: FormGroup;
    roleList: [string];
    // userServiceMsg:string;
    username:string;
    email:string;
    ngOnInit() {
        this.roleList = ['cityAdmin','cityManager','departmentAdmin','departmentUser'];
        this.userAddForm = this.formBuilder.group({
            'name': [''/*,Validators.required*/],
            'surname': [''/*,Validators.required*/],
            'username': ['',Validators.required],
            'passwordForm': this.formBuilder.group({
                'pw1':['',Validators.required],
                'pw2':['',Validators.required]
            }, {validator: this.noMatchingPassword} ),
            'email': ['', [Validators.required,Validators.pattern(EMAIL_REGEX)]],
            'role_name': ['',Validators.required],
            'position': ['',Validators.required]
        })
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

    submitNewUser() {
        this.username = this.userAddForm.get('username').value;
        this.email = this.userAddForm.get('email').value;
        let toAddUser = this.userAddForm.value;
        toAddUser.password = this.userAddForm.controls.passwordForm.get("pw1").value;
        delete toAddUser.passwordForm;
        this.usersServ.add_user(toAddUser).subscribe(
            data => {},
            error => {
                // this.userAddForm.markAsPristine();
                if (error.error == "duplicate_username") {
                    // this.userServiceMsg = 'duplicate_username';
                    let usernameObj = {username:this.userAddForm.get('username').value};
                    this.toastr.error(this.translationService.get_instant('DASHBOARD.USERNAME_EXISTS_MSG', usernameObj), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                    this.userAddForm.get('username').setErrors({usernameExists: true});
                }
                else if (error.error == "duplicate_email") {
                    // this.userServiceMsg = 'duplicate_email';
                    let emailObj = {email:this.userAddForm.get('email').value};
                    this.toastr.error(this.translationService.get_instant('DASHBOARD.EMAIL_EXISTS_MSG', emailObj), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                    this.userAddForm.get('email').setErrors({emailExists: true});
                }
                else {
                    // this.userServiceMsg = 'services_error';
                    this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                }
            },
            () => {
                let usernameObj = {username:this.userAddForm.get('username').value};
                this.toastr.success(this.translationService.get_instant('DASHBOARD.USER_ADDED_MSG', usernameObj), this.translationService.get_instant('SUCCESS'), {timeOut:8000, progressBar:true, enableHtml:true})
                // this.userServiceMsg = 'success';
                this.userAddForm.reset();
            }
        )
    }

    // ngOnDestroy() {
    //     this.subscription.unsubscribe();
    // }

}
