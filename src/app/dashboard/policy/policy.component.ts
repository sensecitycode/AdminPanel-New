import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms'
import { Subscription } from 'rxjs/Subscription';


import { MunicipalityService } from '../municipality.service'
import { DepartmentsService } from '../departments/departments.service';

import { ToastrService } from 'ngx-toastr'
import { TranslationService } from '../../shared/translation.service'

@Component({
    selector: 'app-policy',
    templateUrl: './policy.component.html',
    styleUrls: ['./policy.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class PolicyComponent implements OnInit {

    constructor(private translationService:TranslationService, private toastr: ToastrService, private municService: MunicipalityService, private depServ: DepartmentsService) { }

    issuesList = ["garbage", "lighting", "plumbing", "road-constructor", "protection-policy", "green", "environment"]
    cityPoliciesForm: FormGroup
    controlDepForm: FormGroup
    issuePoliciesForm: FormGroup

    departments:any[];
    subscriptions = new Subscription();

    activeSmsService:string
    ngOnInit() {
        this.departments = this.depServ.return_departmentsArray()

        if (this.departments.length == 0) {
            this.subscriptions.add(this.depServ.departmentsChanged.subscribe(
                (status:string) => {
                if (status == "departmentsArrayPopulated")
                    this.departments = this.depServ.return_departmentsArray();
            }))
            this.depServ.populate_departmentsArray()
        }

        this.controlDepForm = new FormGroup ({
            'control_department': new FormControl(''),
        })

        this.cityPoliciesForm = new FormGroup ({
            'mandatory_email': new FormControl(false),
            'mandatory_sms': new FormControl(false),
            'active_sms_service': new FormControl("false"),
            'sms_key_fibair': new FormControl(''),
        })

        this.issuePoliciesForm = new FormGroup ({
            'garbage': new FormGroup({
                add_issue: new FormControl(0), anonymous: new FormControl('false'), policy_desc: new FormControl('')
            }),
            'lighting': new FormGroup({
                add_issue: new FormControl(0), anonymous: new FormControl('false'), policy_desc: new FormControl('')
            }),
            'plumbing': new FormGroup({
                add_issue: new FormControl(0), anonymous: new FormControl('false'), policy_desc: new FormControl('')
            }),
            'road-constructor': new FormGroup({
                add_issue: new FormControl(0), anonymous: new FormControl('false'), policy_desc: new FormControl('')
            }),
            'protection-policy': new FormGroup({
                add_issue: new FormControl(0), anonymous: new FormControl('false'), policy_desc: new FormControl('')
            }),
            'green': new FormGroup({
                add_issue: new FormControl(0), anonymous: new FormControl('false'), policy_desc: new FormControl('')
            }),
            'environment': new FormGroup({
                add_issue: new FormControl(0), anonymous: new FormControl('false'), policy_desc: new FormControl('')
            })
        })

        this.fetchCityPolicies()
    }

    fetchCityPolicies() {
      this.municService.get_municipality_policy()
      .subscribe(
          data => {
              this.controlDepForm.patchValue({
                  'control_department':data[0].control_department,
              })

              this.cityPoliciesForm.patchValue({
                  'mandatory_sms': data[0].mandatory_sms,
                  'mandatory_email': data[0].mandatory_email,
                  'active_sms_service': (data[0].active_sms_service == 'true'),
                  'sms_key_fibair': data[0].sms_key_fibair
              })
          },
          error => this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
      )

      this.issuesList.forEach( (issue) => {
          this.municService.get_municipality_issue_policy(issue)
          .subscribe(
              data => {
                  this.issuePoliciesForm.get(issue).patchValue({
                      add_issue: data[0].add_issue,
                      anonymous: data[0].anonymous,
                      policy_desc: data[0].policy_desc
                  })
              },
              error => this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
          )
      })
    }


    submit(panel) {
        let sub_obj = {}
        switch (panel) {
          case 'control_dep':
            sub_obj = {'control_department': this.controlDepForm.get('control_department').value}
            this.municService.update_municipality_policy(sub_obj).subscribe(
              data => {},
              error => this.toastr.error(this.translationService.get_instant('DASHBOARD.POLICY_UPDATE_ERROR'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true}),
              () => {
                this.toastr.success(this.translationService.get_instant('DASHBOARD.POLICY_UPDATE_MSG'), this.translationService.get_instant('SUCCESS'), {timeOut:5000, progressBar:true, enableHtml:true})
                this.fetchCityPolicies()
              }
            )
            break

          case 'information_means':
            sub_obj = {
              'mandatory_sms': this.cityPoliciesForm.get('mandatory_sms').value,
              'mandatory_email': this.cityPoliciesForm.get('mandatory_email').value,
              'active_sms_service': this.cityPoliciesForm.get('active_sms_service').value.toString(),
              'sms_key_fibair': this.cityPoliciesForm.get('sms_key_fibair').value
            }
            if (this.cityPoliciesForm.valid) {
              this.municService.update_municipality_policy(sub_obj).subscribe(
                data => {},
                error => this.toastr.error(this.translationService.get_instant('DASHBOARD.POLICY_UPDATE_ERROR'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true}),
                () => {
                  this.toastr.success(this.translationService.get_instant('DASHBOARD.POLICY_UPDATE_MSG'), this.translationService.get_instant('SUCCESS'), {timeOut:5000, progressBar:true, enableHtml:true})
                  this.fetchCityPolicies()
                }
              )

            }
            break

          case 'issue_policies':
            this.issuesList.forEach( (issue) => {
              sub_obj = {
                'add_issue': +this.issuePoliciesForm.get(issue).get('add_issue').value,
                'anonymous': this.issuePoliciesForm.get(issue).get('anonymous').value,
                'policy_desc': this.issuePoliciesForm.get(issue).get('policy_desc').value,
                'category': issue
              }
              this.municService.update_municipality_issue_policy(sub_obj).subscribe(
                data => {},
                error => this.toastr.error(this.translationService.get_instant('DASHBOARD.ISSUE_POLICY_UPDATE_ERROR', {type:this.translationService.get_instant('DASHBOARD.'+issue)}), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true}),
                () => {
                  this.toastr.success(this.translationService.get_instant('DASHBOARD.POLICY_UPDATE_MSG'), this.translationService.get_instant('SUCCESS'), {timeOut:5000, progressBar:true, enableHtml:true})
                  if (this.issuesList[this.issuesList.length-1] == issue) {
                    this.fetchCityPolicies()
                  }
                }
              )
            })
        }
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe()
    }

}
