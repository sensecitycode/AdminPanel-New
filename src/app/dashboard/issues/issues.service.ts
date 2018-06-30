import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Subject } from 'rxjs/Subject';
import { TranslationService } from '../../shared/translation.service';
import { ToastrService } from 'ngx-toastr';


@Injectable()
export class IssuesService {

    constructor(private httpClient: HttpClient, private translationService:TranslationService, private toastr: ToastrService) { }

    role:string;
    uuid:string;
    city:string;
    API:string;
    departments_ids = [];
    departments = [];
    statisticsUrl:string;
    googleKey:string;
    cityCenter:{
        lat:number,
        lng:number,
        zoom:number
    }


    issuesViewPerPage: string = '20';
    issuesSorting:string = "-1";
    issuesSelected:string = "all";
    cachedIssues = [];
    actionGroupSelect:string = 'DEPARTMENT_ISSUES';

    fetch_issues(reqparams) {
        //
        //awaiting migrate
        // this.uuid = 'dGVzdDIxMjM0NTY3OFdlZCBNYXIgMjggMjAxOCAxODo0NjozMSBHTVQrMDMwMCAoRUVTVCk=';
        // this.role = 'cityAdmin';
        //
        //
        reqparams.city = this.city;
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid).append('x-role', this.role);
        return this.httpClient.get<any>(`${this.API}/admin/issue`,{params: reqparams, headers: reqheaders})
    }

    fetch_fixed_points() {
        return this.httpClient.get<any>(`assets/env-specific/${this.city}.json`)
    }

    fetch_issue_comment(bug_id) {
        //
        //awaiting migrate
        // this.uuid = 'dGVzdDIxMjM0NTY3OFdlZCBNYXIgMjggMjAxOCAxODo0NjozMSBHTVQrMDMwMCAoRUVTVCk=';
        // this.role = 'cityAdmin';
        //
        //
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid).append('x-role', this.role);
        return this.httpClient.post<any>(`${this.API}/admin/bugs/comment`, {id:bug_id}, {headers: reqheaders})
    }

    get_issue_icon (issue) {
        let icon
        switch (issue) {
            case 'lighting':
                icon = 'fa-lightbulb-o';
                break;
            case 'road-constructor':
                icon = 'fa-road';
                break;
            case 'garbage':
                icon = 'fa-trash-o';
                break;
            case 'green':
                icon = 'fa-tree';
                break;
            case 'plumbing':
                icon = 'fa-umbrella';
                break;
            case 'environment':
                icon = 'fa-leaf';
                break;
            case 'protection-policy':
                icon = 'fa-shield';
                break;
        }
        return icon
    }

    updateIssueStatus = new Subject();
    update_bug(update_obj, comment, files) {
        // this.uuid = 'dGVzdDIxMjM0NTY3OFdlZCBNYXIgMjggMjAxOCAxODo0NjozMSBHTVQrMDMwMCAoRUVTVCk=';
        // this.role = 'cityAdmin';

        //add mantatory field 'product' at update object
        update_obj['product'] = this.city;

        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid).append('x-role', this.role);
        this.httpClient.post<any>(`${this.API}/admin/bugs/update`, update_obj, {headers: reqheaders})
        .subscribe(
            data1 => {},
            error1 => {
                console.error(error1);
                console.error("error at 1st request");
                this.toastr.error(this.translationService.get_instant('DASHBOARD.ISSUE_FAILURE_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true});
            },
            () => {

                if (comment == '') comment = 'undefined'
                let comment_obj = {"comment":comment, "id":update_obj.ids[0]}
                this.httpClient.post<any>(`${this.API}/admin/bugs/comment/add`, comment_obj, {headers: reqheaders})
                .subscribe(
                    data2 => {
                        let comment_tag_obj = {"component":update_obj.component, "status":update_obj.status, "bug_id":update_obj.ids[0], "comment_id": data2.id}
                        this.httpClient.post(`${this.API}/admin/bugs/comment/tags`, files, {headers: reqheaders, params:comment_tag_obj, responseType:'text' })
                        .subscribe(
                            data3 => {},
                            error3 => {
                                console.error(error3);
                                console.error("error at 3rd request");
                                this.toastr.error(this.translationService.get_instant('DASHBOARD.ISSUE_FAILURE_MSG_ID', {id:update_obj.ids[0]}), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true});
                            },
                            () => {
                                this.updateIssueStatus.next(update_obj.ids[0])
                                this.toastr.success(this.translationService.get_instant('DASHBOARD.ISSUE_SUCCESS_MSG_ID', {id:update_obj.ids[0]}), this.translationService.get_instant('SUCCESS'), {timeOut:7000, progressBar:true, enableHtml:true});
                            }
                        )
                    },
                    error2 => {
                        console.error(error2)
                        console.error("error at 2nd request")
                        this.toastr.error(this.translationService.get_instant('DASHBOARD.ISSUE_FAILURE_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                    },
                    () => {}
                )
            }
        )
    }

    get_issue_address(latitude, longitude) {
        let query_lang = this.translationService.getLanguage();
        return this.httpClient.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=false&language=${query_lang}&key=${this.googleKey}`)
    }

    get_address_coordinates(address) {
        this.city != 'testcity1' ? address += ` ,${this.city}` : address += ' ,patra';
        let query_lang = this.translationService.getLanguage();
        return this.httpClient.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&sensor=false&language=${query_lang}&key=${this.googleKey}`)
    }

    get_IBMwatson_recommendations(bug_id) {
        return this.httpClient.post<any>(`${this.API}/watson`, {bugID:bug_id})
    }
}
