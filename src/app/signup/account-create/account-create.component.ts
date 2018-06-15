import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import {FormControl, Validators, AbstractControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs/Subscription';
import { ToastrService } from 'ngx-toastr';

import { TranslationService} from '../../shared/translation.service';

import { AppBootStrapComponent } from '../../../app/app-bootstrap.component';


@Component({
    selector: 'app-account-create',
    templateUrl: './account-create.component.html',
    styleUrls: ['./account-create.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class AccountCreateComponent implements OnInit {

    constructor(private translationService: TranslationService, private bootstrapComp : AppBootStrapComponent, private http: HttpClient, private toastr: ToastrService) { }

    subscriptions = new Subscription();
    accountForm: FormGroup;
    API:string;
    ngOnInit() {
        this.accountForm = new FormGroup({
            username: new FormControl('', Validators.required),
            passwordForm: new FormGroup({
                pw1: new FormControl('', Validators.required),
                pw2: new FormControl('', Validators.required)
            }, this.noMatchingPassword),
            department: new FormControl('', Validators.required)
        })


        this.subscriptions.add(this.translationService.get('SIGNUP.MAIN_DEPARTMENT')
            .subscribe(translatedStr =>
            {
                this.accountForm.patchValue({department:translatedStr})
            }
        ))

        this.API = this.bootstrapComp.API;

    }

    noMatchingPassword(AC: any) {
        let pass = AC.get('pw1');
        let confirmPass = AC.get('pw2');

        if (pass.value != confirmPass.value) {
            confirmPass.setErrors({noMatchingPassword: true});
        } else {
            confirmPass.setErrors(null);
            return null
        }
    }

    usernameExists:string = "0";
    checkUsernameExists(username) {
        this.http.post<any>(`${this.API}/check_user`, {username:username})
            .subscribe(
                data => { this.usernameExists = data[0].username },
                error => {
                    // alert("Check username availability service is not responding!");
                    this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                },
                () => {
                    if (this.usernameExists == "1" ) {
                        this.accountForm.get('username').setErrors({usernameExists:true})
                    }
                    // clearTimeout(fetchUsers_canc);
                }
            )
    }

    onSubmit() {    };
    // accountFormControl = new FormControl('', Validators.required);
    // passwordFormControl = new FormControl('', Validators.required);
    // confirmPasswordFormControl = new FormControl('', Validators.required);
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }


}
