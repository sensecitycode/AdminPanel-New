import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { UsersService } from '../../../users/users.service';
import { DepartmentsService } from '../../departments.service';



@Component({
    selector: 'app-edit-department',
    templateUrl: './edit-department.component.html',
    styleUrls: ['./edit-department.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class EditDepartmentComponent implements OnInit {

    constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private depServ: DepartmentsService, private usersServ: UsersService) { }

    originalDepName:string;
    depEditForm: FormGroup;
    originalDepFormValue: object;
    department:object;
    departmentServiceMsg:string;

    subscription = new Subscription;
    users = [];
    possibleAdminUsers = [];
    issueAdmins = [];
    nonIssueAdmins = [];
    allDepartmentUsers = [];


    ngOnInit() {
        this.depEditForm = this.formBuilder.group({
            'name': ['',Validators.required],
            'users':['', Validators.required],
            'manager': ['',Validators.required],
            'cclist': ['']
        })

        this.department = {
            "default_assigned_email": "test1@hotmail.com",
            "default_cc_list": [
                {
                    "disabledtext": "",
                    "login_name": "info@sense.city",
                    "disable_mail": "0",
                    "extern_id": null,
                    "last_seen_date": "2018-02-12",
                    "is_enabled": "1",
                    "realname": "info@sense.city",
                    "userid": "11",
                    "showmybugslink": "1"
                },
                {
                    "disable_mail": "0",
                    "login_name": "sxediasmou_mel@sense.city",
                    "disabledtext": "",
                    "userid": "118",
                    "realname": "surname13 name13",
                    "is_enabled": "1",
                    "extern_id": null,
                    "last_seen_date": null,
                    "showmybugslink": "1"
                }
            ],
            "is_active": true,
            "component_name": "testdep"
        }

        this.originalDepName = this.activatedRoute.snapshot.url[0].path;

        this.subscription.add(this.usersServ.usersChanged.subscribe(
            (status:string) => {
                if (status == "userArrayPopulated"){
                    console.log("status == userArrayPopulated");
                    this.users = this.usersServ.return_userArray();
                    this.possibleAdminUsers = this.users.slice();
                    for (let user of this.possibleAdminUsers){
                        if (user.role_name.length == 1 && user.role_name[0] == "cityAdmin") {
                            this.possibleAdminUsers.splice(this.users.indexOf(user), 1); // cityAdmins do NOT manage city issues
                        } else {
                            for (let role of user.role_name) {
                                if (role == "cityManager") {
                                    user.isCityManager = true; // has 'cityManager' in rolelist
                                    this.issueAdmins.push(user);
                                    break;
                                }
                            }
                        }
                    }

                    this.allDepartmentUsers = this.issueAdmins;

                    //extra admin user added that isn't already in users!
                    let extraUser = this.users.find(extraUser => {return extraUser.username == 'test1'});
                    if (!extraUser.role_name.includes("cityManager")){
                        this.nonIssueAdmins.push(extraUser);
                    }
                    //

                    //manager initial value
                    let manager = this.users.find(manager => {return manager.email == this.department['default_assigned_email']})


                    //cclist initial value
                    let cclist = [];
                    for (let user of this.department['default_cc_list']) {
                        cclist.push(this.users.find(idx => {return idx.email == user.login_name}))
                    }

                    this.allDepartmentUsers = this.issueAdmins.concat(this.nonIssueAdmins);


                    this.depEditForm.patchValue({
                        name:this.originalDepName,
                        users:this.allDepartmentUsers,
                        manager:manager,
                        cclist:cclist
                    });
                    this.originalDepFormValue = this.depEditForm.value;

                }
            }
        ));
        this.usersServ.populate_userArray();

    }

    onAddUser(){
        let selectedUsers = this.depEditForm.get('users').value;
        console.log(selectedUsers);
        console.log(this.issueAdmins);

        this.nonIssueAdmins = [];
        for (let selUser of selectedUsers) {
            let matchFound = false;
            for (let issueAdmin of this.issueAdmins) {
                if (issueAdmin._id == selUser._id) {
                    matchFound = true;
                    break;
                }
            }
            if (matchFound == false) {
                this.nonIssueAdmins.push(selUser)
            }
            console.log(this.nonIssueAdmins);
        }
        // this.departmentUsers.push(...this.issueAdmins);
        // this.nonIssueAdmins.push(...selectedUsers);
        // this.departmentAddForm.patchValue({users:selectedUsers});
        this.allDepartmentUsers = this.issueAdmins.concat(this.nonIssueAdmins);
        console.log(this.allDepartmentUsers.length);
        console.log(this.allDepartmentUsers);
    }

    onRemoveUser(index){
        console.log(index);
        console.log(this.issueAdmins.length);
        console.log(this.issueAdmins.length+index);
        this.nonIssueAdmins.splice(index, 1);
        this.allDepartmentUsers = this.issueAdmins.concat(this.nonIssueAdmins);
        this.depEditForm.patchValue({users:this.allDepartmentUsers});
    }

    submitEditedUser() {
        let editedDepartment =
        {
          	'name': this.depEditForm.get('name').value,
          	'users': this.depEditForm.get('users').value,
          	'manager': this.depEditForm.get('manager').value,
          	'cclist': this.depEditForm.get('cclist').value,
        };

        console.log(editedDepartment);
        // this.usersServ.edit_user(editedUser).subscribe(
        //   data => {console.log(data)},
        //   error => {
        //     console.log(error);
        //     this.userServiceMsg = 'error';
        //     this.userEditForm.markAsPristine();
        //     // if (error.error == "duplicate_surname") {
        //     //   this.userServiceMsg = 'duplicate_username';
        //     //   this.userEditForm.get('username').setErrors({usernameExists: true});
        //     // }
        //     // if (error.error == "duplicate_email") {
        //     //   this.userServiceMsg = 'duplicate_email';
        //     //   this.userEditForm.get('email').setErrors({emailExists: true});
        //     // }
        //   },
        //   () => {
        //       this.originalUsername = editedUser.username;
        //       this.userEditForm.markAsPristine();
        //       this.userServiceMsg = 'success';
        //   }
        // )

    }

    onResetEdit() {
        this.depEditForm.setValue(this.originalDepFormValue);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
