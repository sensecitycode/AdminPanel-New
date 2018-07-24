import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Subject } from 'rxjs/Subject';
import { TranslationService } from '../shared/translation.service';
import { ToastrService } from 'ngx-toastr';

// import { Router, ActivatedRoute } from '@angular/router';

@Injectable()
export class MunicipalityService {

    constructor(private httpClient: HttpClient, private translationService:TranslationService, private toastr: ToastrService) { }


    uuid:string;
    city:string;
    API:string;
    cityCenter:{
        lat:number,
        lng:number,
        zoom:number
    }

    // usersChanged = new Subject();

    get_boundaries() {
        return this.httpClient.get<any>(`${this.API}/city_coordinates?city=${this.city}`, {responseType:'json'})
    }

    update_municipality_boundaries(updateObj) {
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid)/*.append('x-role', this.role)*/;
        return this.httpClient.post<any>(`${this.API}/admin/edit_city`,
            updateObj,
            {
                headers: reqheaders
            })
            // this.usersChanged.next("userEdited");
    }

    get_municipality_policy() {
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid)/*.append('x-role', this.role)*/;
        return this.httpClient.get<any>(`${this.API}/admin/municipality?city=${this.city}`, {headers: reqheaders})
    }

    get_municipality_issue_policy(issue) {
        return this.httpClient.get<any>(`${this.API}/city_policy?coordinates=[${this.cityCenter.lng},${this.cityCenter.lat}]&issue=${issue}`)
    }

    update_municipality_policy(updateObj) {
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid)/*.append('x-role', this.role)*/;
        return this.httpClient.post<any>(`${this.API}/admin/municipality` , updateObj, {headers: reqheaders})
    }

    update_municipality_issue_policy(updateObj) {
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid)/*.append('x-role', this.role)*/;
        return this.httpClient.post<any>(`${this.API}/admin/citypolicy` , updateObj, {headers: reqheaders})
    }


}
