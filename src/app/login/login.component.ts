import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class LoginComponent implements OnInit {

    loginForm: FormGroup;

    constructor(fb:FormBuilder ,private router: Router, private authService: AuthService) {
        this.loginForm = fb.group({
            'username': ['', Validators.required],
            'password': ['', Validators.required],
        })
    }

    ngOnInit() {}

    wrongCredentials:boolean = false;
    servicesError:boolean = false;
    onSubmit() {
        if (this.loginForm.valid) {
            let loginData =
            {
                "username":this.loginForm.controls.username.value,
                "password":this.loginForm.controls.password.value
            };
            const loginReq = this.authService.login(loginData)
                .subscribe(
                    data => {
                                sessionStorage.setItem('uuid', data[0]['uuid']);
                                sessionStorage.setItem('role', data[0]['role_id']);
                                sessionStorage.setItem('city', data[0]['city']);
                                sessionStorage.setItem('departments', data[0]['departments']);
                                sessionStorage.setItem('username', data[0]['username']);
                                sessionStorage.setItem('email', data[0]['email'])
                                sessionStorage.setItem('last_login', data[0]['last_login']);
                                sessionStorage.setItem('position', data[0]['position']);
                                this.router.navigate(['/dashboard/home']);
                            },
                    error =>{
                                this.loginForm.controls.username.markAsPristine();
                                this.loginForm.controls.password.markAsPristine();
                                this.loginForm.markAsUntouched();
                                if (error.error.text == 'failure') {
                                    this.wrongCredentials = true;
                                } else {
                                    this.servicesError = true
                                }
                            },
                    () => {}
                )
        }
    }
    }
