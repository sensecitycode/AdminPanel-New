import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';


import { UsersService } from '../users/users.service';
import { TranslationService } from '../../shared/translation.service';



@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class AccountComponent implements OnInit {

    constructor( private usersService : UsersService, private toastr: ToastrService, private translationService:TranslationService, private formBuilder: FormBuilder,private http: HttpClient) { }

    username = this.usersService.username;
    email = this.usersService.username;
    position = this.usersService.position
    passwordForm: FormGroup;

    ngOnInit() {


        this.passwordForm = this.formBuilder.group({
            'old_pass': ['', Validators.required],
            'pass': ['', Validators.required],
            'confirm_pass': ['', Validators.required]
        }, {validator: this.noMatchingPassword})
    }

    noMatchingPassword(AC: AbstractControl) {
        let pass = AC.get('pass');
        let confirmPass = AC.get('confirm_pass');
        if (pass.value != confirmPass.value) {
            confirmPass.setErrors({noMatchingPassword: true});
        } else {
            confirmPass.setErrors(null);
            return null
        }
    }

    wrongPassword = false;
    onSubmit() {
        this.wrongPassword = false;
        let req_obj = {
            'old_pass': this.passwordForm.get('old_pass').value,
            'pass': this.passwordForm.get('pass').value
        }

        this.usersService.change_user_pass(req_obj)
            .subscribe(
                data => {
                    if (data['status'] == 'WRONG_PASS') {
                        this.toastr.error(this.translationService.get_instant('DASHBOARD.ACCOUNT_EDIT_WRONG_PASS'), this.translationService.get_instant('ERROR'), {timeOut:5000, progressBar:true, enableHtml:true})
                        this.wrongPassword = true;
                        this.passwordForm.get('old_pass').markAsPristine()
                    }
                    if (data['status'] == 'ok') {
                        this.toastr.success(this.translationService.get_instant('DASHBOARD.ACCOUNT_EDIT_SUCCESS'), this.translationService.get_instant('SUCCESS'), {timeOut:6000, progressBar:true, enableHtml:true})
                        this.passwordForm.reset()
                    }
                },
                error => this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:5000, progressBar:true, enableHtml:true})
            )
    }


}
