import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';

import { UsersService } from '../users.service';



@Component({
    selector: 'app-add-user',
    templateUrl: './add-user.component.html',
    styleUrls: ['./add-user.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class AddUserComponent implements OnInit {

    constructor(private formBuilder: FormBuilder, private usersServ: UsersService) { }

    userAddForm: FormGroup;
    roleList: [string];
    userServiceMsg:string;
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
            'email': ['', [Validators.required,Validators.email]],
            'role_name': ['',Validators.required],
            'position': ['',Validators.required]
        })
    }

    noMatchingPassword(AC: AbstractControl) {
        // console.log(AC);
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
            this.userAddForm.markAsPristine();
            if (error.error == "duplicate_username") {
              this.userServiceMsg = 'duplicate_username';
              this.userAddForm.get('username').setErrors({usernameExists: true});
            }
            if (error.error == "duplicate_email") {
              this.userServiceMsg = 'duplicate_email';
              this.userAddForm.get('email').setErrors({emailExists: true});
            }
          },
          () => {
            this.userServiceMsg = 'success';
            this.userAddForm.reset();
          }
        )
    }

    // ngOnDestroy() {
    //     this.subscription.unsubscribe();
    // }

}
