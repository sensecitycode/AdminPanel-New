import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { MapLinkComponent } from './map-link/map-link.component';
import { AccountCreateComponent} from './account-create/account-create.component';

import { AppBootStrapComponent } from '../../app/app-bootstrap.component';



@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class SignupComponent implements OnInit {

    @ViewChild(PersonalInfoComponent) persInfo;
    @ViewChild(MapLinkComponent) mapLink;
    @ViewChild(AccountCreateComponent) accCreate;

    personalInfoForm:FormGroup;
    mapForm:FormGroup;
    accountForm:FormGroup;
    submitForm:FormGroup;


    constructor(private bootstrapComp : AppBootStrapComponent, private http: HttpClient, private router: Router,) {
        this.personalInfoForm = new FormGroup({});
        this.mapForm = new FormGroup({});
        this.accountForm = new FormGroup({});
        this.submitForm = new FormGroup({
            // city_acknowledge: new FormControl(''),
            terms_acknowledge: new FormControl('')
        });
    }

    API:string;
    ngOnInit() {
        this.API = this.bootstrapComp.API;
    }

    ngAfterViewInit() {
        this.personalInfoForm = this.persInfo.personalInfoForm;
        this.mapForm = this.mapLink.mapForm;
        this.accountForm = this.accCreate.accountForm;
    }

    requestGuard:boolean = false;
    servicesError:boolean
    badRequest:boolean
    success:boolean
    onSubmit(){
        this.requestGuard = true;

        this.servicesError = false;
        this.badRequest = false;
        this.success = false;

        this.personalInfoForm.markAsPristine()
        this.mapForm.markAsPristine()
        this.accountForm.markAsPristine()
        this.submitForm.markAsPristine()

        let submitObject = {
            city: this.mapForm.get('domain').value,
            municipality_desc: this.mapForm.get('city').value,
            default_assignee: this.personalInfoForm.get('email').value,
            name: this.personalInfoForm.get('firstname').value,
            surname: this.personalInfoForm.get('lastname').value,
            position: this.personalInfoForm.get('position').value,
            phone_number: this.personalInfoForm.get('telephone').value,
            username: this.accountForm.get('username').value,
            password: this.accountForm.get('passwordForm').value.pw1,
            department: this.accountForm.get('department').value,
        }
        this.http.post(`${this.API}/admin/add_city`, submitObject, {responseType:'text'})
            .subscribe(
                data => {  },
                error => {
                    console.error(error);
                    this.requestGuard = false;
                    if (error.error == "Bad Request") {
                        this.badRequest = true
                    } else {
                        this.servicesError = true;
                    }
                    // this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                },
                () => {
                    this.success = true;
                    // setTimeout(() => {
                    //     this.router.navigate(['/login']);
                    // }, 10000)

                }
            )

    };
}
