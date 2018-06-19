import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {FormControl, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';


import { AppBootStrapComponent } from '../../../app/app-bootstrap.component';
import { TranslationService } from '../../shared/translation.service';

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

@Component({
    selector: 'app-personal-info',
    templateUrl: './personal-info.component.html',
    styleUrls: ['./personal-info.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class PersonalInfoComponent implements OnInit {

    constructor(private bootstrapComp : AppBootStrapComponent, private http: HttpClient, private translationService: TranslationService, private toastr: ToastrService) { }

    API:string;
    ngOnInit() {
        this.API = this.bootstrapComp.API;
    }

    personalInfoForm = new FormGroup ({
        position: new FormControl('', Validators.required),
        firstname: new FormControl('', Validators.required),
        lastname: new FormControl('', Validators.required),
        telephone: new FormControl('', [Validators.required,Validators.pattern(/^[0-9]*$/)]),
        email: new FormControl('', [Validators.required,Validators.pattern(EMAIL_REGEX)])
        // addressForm: new FormGroup ({
        //    road: new FormControl(''),
        //    city: new FormControl(''),
        //    province: new FormControl(''),
        //    postal: new FormControl('')
        // })
    });

    emailExists:string = "0";
    checkEmailExists(email) {
        this.http.post<any>(`${this.API}/check_user`, {email:email})
            .subscribe(
                data => { this.emailExists = data[0].email },
                error => {
                    // alert("Check email availability service is not responding!");
                    this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                    // this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                },
                () => {
                    if (this.emailExists == "1" ) {
                        this.personalInfoForm.get('email').setErrors({emailExists:true})
                    }
                    // clearTimeout(fetchUsers_canc);
                }
            )
    }
}
