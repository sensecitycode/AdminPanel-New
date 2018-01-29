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
                                // console.log(data[0]);
                                sessionStorage.setItem('uuid', data[0]['uuid']);
                                sessionStorage.setItem('role', data[0]['role_id']);
                                sessionStorage.setItem('city', data[0]['city']);
                                sessionStorage.setItem('departments', data[0]['departments']);
                                sessionStorage.setItem('username', data[0]['username']);
                                sessionStorage.setItem('last_login', data[0]['last_login']);
                                this.router.navigate(['/dashboard']);
                            },
                    error =>{
                                console.log(error);
                                if (error.error.text == 'failure')
                                {
                                    clearTimeout(loginReq_canc);
                                    this.wrongCredentials = true;
                                    this.loginForm.controls.username.markAsPristine();
                                    this.loginForm.controls.password.markAsPristine();
                                    this.loginForm.markAsUntouched();
                                }
                            },
                    () => {clearTimeout(loginReq_canc)}
                )

                let loginReq_canc = setTimeout(() => {
                    loginReq.unsubscribe();
                    alert("Login Service is not responding!");
                }, 5000);
        }
    }
    }
