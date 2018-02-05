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
    possibleAdminUsers = [];
    issueAdmins = [];
    otherDepartmentUsers = [];
    allDepartmentUsers = [];
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
                    this.possibleAdminUsers = this.users;
                    for (let user of this.users){
                        if (user.role_name.length == 1 && user.role_name[0] == "cityAdmin") {
                            this.possibleAdminUsers.splice(this.users.indexOf(user), 1);
                        } else {
                            for (let role of user.role_name) {
                                if (role == "cityManager") {
                                    // user.cityManager = true;
                                    this.issueAdmins.push(user);
                                    break;
                                }
                                // if (role == "cityAdmin") {
                                //     this.possibleAdminUsers.splice(this.users.indexOf(user), 1);
                                //     break;
                                // }
                            }
                        }
                    }
                    console.log(this.users);
                    this.departmentAddForm.patchValue({users:this.issueAdmins});
                    this.allDepartmentUsers = this.issueAdmins;

                    // this.departmentUsers.push(...this.issueAdmins);

                    console.log(this.possibleAdminUsers);
                }
            }
        ));
        this.usersServ.populate_userArray();
    }


    onAddUser(){
        let user = this.departmentAddForm.get('users').value;
        console.log(user);

        this.otherDepartmentUsers = [];
        // this.departmentUsers.push(...this.issueAdmins);
        this.otherDepartmentUsers.push(...user);
        this.departmentAddForm.patchValue({users:user});
        this.allDepartmentUsers = this.issueAdmins.concat(this.otherDepartmentUsers);
        console.log(this.allDepartmentUsers.length);
        console.log(this.allDepartmentUsers);
    }

    onRemoveUser(index){
        console.log(index);
        this.otherDepartmentUsers.splice(index, 1);
        this.departmentAddForm.patchValue({users:this.otherDepartmentUsers});
        this.allDepartmentUsers = this.issueAdmins.concat(this.otherDepartmentUsers);
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
        this.otherDepartmentUsers = [];
        this.departmentServiceMsg = '';
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
