import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { UsersService } from '../users.service';



@Component({
    selector: 'app-add-user',
    templateUrl: './add-user.component.html',
    styleUrls: ['./add-user.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AddUserComponent implements OnInit {

    constructor(private formBuilder: FormBuilder, private usersServ: UsersService) { }

    userAddForm: FormGroup;
    roleList: [string];
    subscription= new Subscription;
    userAdded:boolean = false;
    username:string;
    ngOnInit() {
        this.roleList = ['cityAdmin','cityManager','departmentAdmin','departmentUser'];
        this.userAddForm = this.formBuilder.group({
            'name': ['',Validators.required],
            'surname': ['',Validators.required],
            'username': ['',Validators.required],
            'passwordForm': this.formBuilder.group({
                'pw1':['',Validators.required],
                'pw2':['',Validators.required]
            }, {validator: this.noMatchingPassword} ),
            'email': ['', [Validators.required,Validators.email]],
            'roles': ['',Validators.required]
        })
        console.log(this.userAddForm);
    }

    noMatchingPassword(AC: AbstractControl) {
        console.log(AC);
        let pass = AC.get('pw1');
        let confirmPass = AC.get('pw2');

        // if (!pass|| !confirmPass) return null;

        if (pass.value != confirmPass.value) {
            confirmPass.setErrors({noMatchingPassword: true});
            console.log(false);
        } else {
            confirmPass.setErrors(null);
            console.log(true);
            return null
        }
    }

    submitNewUser() {
        this.username = this.userAddForm.get('username').value;
        console.log(this.username)
        this.subscription.add(this.usersServ.usersChanged.subscribe(
            status => {
                console.log(`status = ${status}`)
                if (status == "userAdded") {
                    this.userAdded = true;
                    this.userAddForm.reset();
                }
            }
        ));
        this.usersServ.add_user(this.userAddForm.value);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
