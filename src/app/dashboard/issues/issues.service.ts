import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable()
export class IssuesService {

    constructor(private httpClient: HttpClient) { }

    role:string;
    uuid:string;
    city:string;
    API:string;



    issuesViewPerPage: string = '20';
    issuesSorting:string = "-1";
    issuesSelected:string = "all";

    fetch_issues(reqparams) {
        //
        //awaiting migrate
        this.uuid = 'dGVzdGNvbnRyb2xAdGVzdGNpdHkxdGVzdGNpdHkxMjM0V2VkIE1hciAyMSAyMDE4IDE1OjI5OjExIEdNVCswMjAwIChFRVQp';
        this.role = 'cityAdmin';
        //
        //
        reqparams.city = this.city;
        console.log("fetch_issues");
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid).append('x-role', this.role);
        return this.httpClient.get<any>(`${this.API}/admin/issue`,{params: reqparams, headers: reqheaders})
    }

    fetch_fixed_points() {
        return this.httpClient.get<any>(`../../../assets/env-specific/dev/${this.city}.json`)
    }

    fetch_issue_comment(bug_id) {
        //
        //awaiting migrate
        this.uuid = 'dGVzdGNvbnRyb2xAdGVzdGNpdHkxdGVzdGNpdHkxMjM0V2VkIE1hciAyMSAyMDE4IDE1OjI5OjExIEdNVCswMjAwIChFRVQp';
        this.role = 'cityAdmin';
        //
        //
        console.log("fetch_issue_comment");
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

}
