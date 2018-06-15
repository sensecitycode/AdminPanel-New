import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { ToastrService } from 'ngx-toastr';

import { TranslationService } from '../../../shared/translation.service';
import { DepartmentsService } from '../departments.service';
import { UsersService } from '../../users/users.service';

@Component({
  selector: 'app-add-department',
  templateUrl: './add-department.component.html',
  styleUrls: ['./add-department.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class AddDepartmentComponent implements OnInit {

    constructor(private formBuilder: FormBuilder, private depServ: DepartmentsService, private usersServ: UsersService, private translationService:TranslationService, private toastr: ToastrService) { }

    subscription = new Subscription;
    users = [];
    possibleAdminUsers = [];
    issueAdmins = [];
    nonIssueAdmins = [];
    allDepartmentUsers = [];
    departmentAddForm: FormGroup;
    roleList: [string];
    newAddedDep:string;
    // departmentServiceMsg:string;
    username:string;
    email:string;
    ngOnInit() {
        this.roleList = ['cityAdmin','cityManager','departmentAdmin','departmentUser'];

        this.departmentAddForm = this.formBuilder.group({
            'name': ['',Validators.required],
            'users':[[], Validators.required],
            'manager': ['',Validators.required],
            'cclist': [[]]
        })

        this.subscription.add(this.usersServ.usersChanged.subscribe(
            (status:string) => {
                if (status == "userArrayPopulated"){
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

                    this.departmentAddForm.patchValue({users:this.issueAdmins});
                    this.allDepartmentUsers = this.issueAdmins;
                }
            }
        ));
        this.usersServ.populate_userArray();
    }


    onAddUser(){
        let selectedUsers = this.departmentAddForm.get('users').value;

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
        }
        this.allDepartmentUsers = this.issueAdmins.concat(this.nonIssueAdmins);
    }

    onRemoveUser(index){
        this.nonIssueAdmins.splice(index, 1);
        this.allDepartmentUsers = this.issueAdmins.concat(this.nonIssueAdmins);
        this.departmentAddForm.patchValue({users:this.allDepartmentUsers});
        if (this.departmentAddForm.get('users').value.indexOf(this.departmentAddForm.get('manager').value) === -1) {
            this.departmentAddForm.patchValue({manager:[]});
        }
    }

    submitNewDepartment() {
        let form = this.departmentAddForm.value;
        let tobeAddedDepartment = {
            department:form.name,
            default_assignee:form.manager.email,
            default_cc:form.cclist.map(idx => idx.email),
            cp_access:this.nonIssueAdmins.map(idx => idx.email)
        }
        // if (form.cclist) {
        //     tobeAddedDepartment['default_cc'] = form.cclist.map(idx => idx.email);
        // }
        this.depServ.add_department(tobeAddedDepartment).subscribe(
            data => {},
            error => {
                this.departmentAddForm.markAsPristine();
                if (error.error == "DUPLICATE_DEPARTMENT") {
                    this.toastr.error(this.translationService.get_instant('DASHBOARD.DEP_NAME_EXISTS_MSG', {"name":tobeAddedDepartment.department}), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                    this.departmentAddForm.get('name').setErrors({nameExists: true});
                } else {
                    this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                }
            },
            () => {
                this.toastr.success(this.translationService.get_instant('DASHBOARD.DEP_ADDED_MSG', {"name":tobeAddedDepartment.department}), this.translationService.get_instant('SUCCESS'), {timeOut:8000, progressBar:true, enableHtml:true})
                this.newAddedDep = tobeAddedDepartment.department;
                this.onReset();
            }
        )
    }

    onReset() {
        this.departmentAddForm.setValue({
            'name': '',
            'users':'',
            'manager': '',
            'cclist': ''
        })
        this.nonIssueAdmins = [];
        this.departmentAddForm.patchValue({users:this.issueAdmins});
        this.allDepartmentUsers = this.issueAdmins;
        this.departmentAddForm.markAsUntouched();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
