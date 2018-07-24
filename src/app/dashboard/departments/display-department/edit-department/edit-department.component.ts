import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject'

import { UsersService } from '../../../users/users.service';
import { DepartmentsService } from '../../departments.service';

import { ToastrService } from 'ngx-toastr'
import { TranslationService } from '../../../../shared/translation.service'


@Component({
    selector: 'app-edit-department',
    templateUrl: './edit-department.component.html',
    styleUrls: ['./edit-department.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class EditDepartmentComponent implements OnInit {

    constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private router: Router, private depServ: DepartmentsService, private usersServ: UsersService, private toastr: ToastrService, private translationService: TranslationService) { }

    originalDepName:string;
    dep_id:string;
    depEditForm: FormGroup;
    originalDepFormValue: any;
    department:any = {};
    departmentServiceMsg:string;

    subscription = new Subscription;
    users = [];
    possibleAdminUsers = [];
    issueAdmins = [];
    originalNonIssueAdmins = [];
    nonIssueAdmins = [];
    originalAllDepartmentUsers = [];
    allDepartmentUsers = [];

    loaded = false
    ngOnInit() {
        this.depEditForm = this.formBuilder.group({
            'name': ['',Validators.required],
            'users':[[]],
            'manager': ['',Validators.required],
            'cclist': [[]]
        })

        this.dep_id = this.activatedRoute.snapshot.url[0].path;

        this.subscription = this.depServ.departmentsChanged.subscribe(
          (status:string) => {
            if (status == "departmentsArrayPopulated"){
              this.initiate()
            }
          }
        )

        if (this.depServ.return_departmentsArray().length == 0) {
            this.depServ.populate_departmentsArray()
        } else {
            this.initiate()
        }
    }

    initiate() {
      let department = this.depServ.return_departmentsArray().find(idx => {return idx.departmentID == this.dep_id});
      if (department)
          {
          this.originalDepName = department.component_name;
          this.department = department;

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
                      this.allDepartmentUsers = this.issueAdmins;

                      //extra admin user added that isn't already in users!
                      for (let cp_user of department.cp_access){
                          let extraUser = this.users.find(extraUser => {return extraUser.username == cp_user.username});
                          if (!extraUser.role_name.includes("cityManager")){
                              this.nonIssueAdmins.push(extraUser);
                          }
                      }
                      //
                      //manager initial value
                      let manager = this.users.find(manager => {return manager.email == department.default_assigned_email[0].assignee_email})

                      //cclist initial value
                      let cclist = [];
                      for (let cclist_user of department.default_cc_list) {
                          cclist.push(this.users.find(idx => {return idx.email == cclist_user.email}))
                      }

                      this.allDepartmentUsers = this.issueAdmins.concat(this.nonIssueAdmins);

                      this.depEditForm.patchValue({
                          name:this.originalDepName,
                          users:this.allDepartmentUsers,
                          manager:manager,
                          cclist:cclist
                      });

                      this.loaded = true
                      console.log(this.depEditForm.value)

                      // keep original values for reset
                      this.originalDepFormValue = this.depEditForm.value;
                      this.originalNonIssueAdmins = this.nonIssueAdmins.slice();
                      this.originalAllDepartmentUsers = this.allDepartmentUsers.slice();
                      console.log(this.originalNonIssueAdmins)
                      console.log(this.originalAllDepartmentUsers)
                  }
              }
          ));
          this.usersServ.populate_userArray();
      }
    }

    onAddUser(){
        let selectedUsers = this.depEditForm.get('users').value;
        console.log("selectedUsers")
        console.log(selectedUsers);
        console.log("this.issueAdmins")
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
        }

        console.log('this.nonIssueAdmins')
        console.log(this.nonIssueAdmins)
        // this.departmentUsers.push(...this.issueAdmins);
        // this.nonIssueAdmins.push(...selectedUsers);
        // this.departmentAddForm.patchValue({users:selectedUsers});
        this.allDepartmentUsers = this.issueAdmins.concat(this.nonIssueAdmins);
        console.log(this.allDepartmentUsers);
    }

    onRemoveUser(index){
        // console.log(index);
        // console.log(this.issueAdmins.length);
        // console.log(this.issueAdmins.length+index);
        this.nonIssueAdmins.splice(index, 1);
        this.allDepartmentUsers = this.issueAdmins.concat(this.nonIssueAdmins);
        this.depEditForm.patchValue({users:this.allDepartmentUsers});
        // console.log(this.depEditForm.get('users').value.indexOf(this.depEditForm.get('manager').value))
        if (this.depEditForm.get('users').value.indexOf(this.depEditForm.get('manager').value) === -1) {
            this.depEditForm.patchValue({manager:[]});
        }
        // console.log(this.depEditForm.get('users').value)
        // console.log(this.depEditForm.get('manager').value)

    }

    departmentEdited = new Subject()
    newAssigneeFinished = false
    newCCListFinished = false
    cpUsersFinished = false
    submitEditedDep() {
      this.newAssigneeFinished = false
      this.newCCListFinished = false
      this.cpUsersFinished = false

      if (this.depEditForm.valid) {


        // catching department edit requests response
        let reqError = false
        this.subscription.add(this.departmentEdited.subscribe(
          (obj) => {
            if (obj['status'] == 'error') {
              this.toastr.error(this.translationService.get_instant('DASHBOARD.NEW_' + obj['request'].toUpperCase() + '_ERR'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
              reqError = true
            }

            if (this.newAssigneeFinished && this.newCCListFinished && this.cpUsersFinished && !reqError) {
              this.toastr.success(this.translationService.get_instant('DASHBOARD.DEP_EDIT_MSG', {department: this.originalDepName}), this.translationService.get_instant('SUCCESS'), {timeOut:8000, progressBar:true, enableHtml:true})
              this.router.navigate(['../../'], {relativeTo:this.activatedRoute})
            }

            if (this.newAssigneeFinished && this.newCCListFinished && this.cpUsersFinished && reqError) {
              this.depServ.populate_departmentsArray()
            }
          }
        ))
        // let editedDepartment =
        // {
        //   	'name': this.depEditForm.get('name').value,
        //   	'users': this.nonIssueAdmins,
        //   	'manager': this.depEditForm.get('manager').value,
        //   	'cclist': this.depEditForm.get('cclist').value,
        // };
        let newAssignee = {
          "oldemail":this.originalDepFormValue.manager.email,
          "newemail":this.depEditForm.get('manager').value.email,
          "componentname":this.originalDepFormValue.name
        }

        console.log(newAssignee)
        this.depServ.set_assignee(newAssignee).subscribe(
          (data) => console.log(data),
          (error) => {
            this.newAssigneeFinished = true
            this.departmentEdited.next({request: 'assignee', status: 'error'})
            console.log(error)
          },
          () => {
            this.newAssigneeFinished = true
            this.departmentEdited.next({request: 'assignee', status: 'success'})
          }
        )

        let newCCList = {
          "componentname":this.originalDepFormValue.name,
          "users":this.depEditForm.get('cclist').value.map( (e) => e.email)
        }

        console.log(newCCList)
        this.depServ.set_ccList(newCCList).subscribe(
          (data) => console.log(data),
          (error) => {
            this.newCCListFinished = true
            this.departmentEdited.next({request: 'ccList', status: 'error'})
            console.log(error)
          },
          () => {
            this.newCCListFinished = true
            this.departmentEdited.next({request: 'ccList', status: 'success'})
          }
        )


        let cpUsers = []
        this.nonIssueAdmins.forEach ( (e) => cpUsers.push({"username":e.username, "departmentID":[this.department.departmentID], "action":"add"}) )
        this.originalNonIssueAdmins.forEach( (originalNonIssueAdmin) => {
          if (this.nonIssueAdmins.includes(originalNonIssueAdmin) == false) {
            cpUsers.push({"username":originalNonIssueAdmin.username, "departmentID":[this.department.departmentID], "action":"remove"})
          }
        })

        console.log(cpUsers)
        this.depServ.set_cpAccess(cpUsers).subscribe(
          (data) => console.log(data),
          (error) => {
            this.cpUsersFinished = true
            this.departmentEdited.next({request: 'cpAccess', status: 'error'})
            console.log(error)
          },
          () => {
            this.cpUsersFinished = true
            this.departmentEdited.next({request: 'cpAccess', status: 'success'})
          }
        )
      }
    }

    onResetEdit() {
        this.depEditForm.setValue(this.originalDepFormValue);
        this.allDepartmentUsers = this.originalDepFormValue['users'];
        this.nonIssueAdmins = this.originalNonIssueAdmins.slice();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
