import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { DepartmentsService } from '../departments.service';
import { UsersService } from '../../users/users.service';

@Component({
  selector: 'app-add-department',
  templateUrl: './add-department.component.html',
  styleUrls: ['./add-department.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class AddDepartmentComponent implements OnInit {

    constructor(private formBuilder: FormBuilder, private depServ: DepartmentsService, private usersServ: UsersService) { }

    subscription = new Subscription;
    users = [];
    departmentUsers = [];
    departmentAddForm: FormGroup;
    roleList: [string];
    departmentServiceMsg:string;
    username:string;
    email:string;
    ngOnInit() {
        this.roleList = ['cityAdmin','cityManager','departmentAdmin','departmentUser'];

        this.departmentAddForm = this.formBuilder.group({
            'name': ['',Validators.required],
            'users':['', Validators.required],
            'manager': ['',Validators.required],
            'cclist': ['']
        })

        this.subscription.add(this.usersServ.usersChanged.subscribe(
            (status:string) => {
                if (status == "userArrayPopulated"){
                    console.log("status == userArrayPopulated");
                    this.users = this.usersServ.return_userArray();
                }
            }
        ));
        this.usersServ.populate_userArray();
        console.log(this.departmentUsers);
        console.log(this.departmentUsers.length);
    }


    onAddUser(){
        let user = this.departmentAddForm.get('users').value;
        this.departmentUsers = [];
        this.departmentUsers.push(...user);
        this.departmentAddForm.patchValue({users:user});
        console.log(this.departmentUsers.length);
    }

    onRemoveUser(index){
        console.log(index);
        this.departmentUsers.splice(index, 1);
        this.departmentAddForm.patchValue({users:this.departmentUsers});
    }

    submitNewDepartment() {
        console.log(this.departmentAddForm);
        // this.username = this.userAddForm.get('username').value;
        // this.email = this.userAddForm.get('email').value;
        // let toAddUser = this.userAddForm.value;
        // toAddUser.password = this.userAddForm.controls.passwordForm.get("pw1").value;
        // this.usersServ.add_user(toAddUser).subscribe(
        //   data => {},
        //   error => {
        //     this.departmentAddForm.markAsPristine();
        //     if (error.error == "duplicate_username") {
        //       this.departmentServiceMsg = 'duplicate_username';
        //       this.departmentAddForm.get('username').setErrors({usernameExists: true});
        //     }
        //     if (error.error == "duplicate_email") {
        //       this.departmentServiceMsg = 'duplicate_email';
        //       this.departmentAddForm.get('email').setErrors({emailExists: true});
        //     }
        //   },
        //   () => {
        //     this.departmentServiceMsg = 'success';
        //     this.departmentAddForm.reset();
        //   }
        // )
    }

    onReset() {
        this.departmentAddForm.setValue({
            'name': '',
            'users':'',
            'manager': '',
            'cclist': ''
        })
        this.departmentUsers = [];
        this.departmentServiceMsg = '';
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
