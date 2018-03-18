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
        this.uuid = 'dGVzdGNvbnRyb2xAdGVzdGNpdHkxdGVzdGNpdHkxMjM0VGh1IE1hciAxNSAyMDE4IDExOjIwOjEzIEdNVCswMjAwIChFRVQp';
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

}
