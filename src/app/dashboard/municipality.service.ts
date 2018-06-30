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
    // usersChanged = new Subject();

    get_boundaries() {
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid)/*.append('x-role', this.role)*/;
        return this.httpClient.get<any>(`${this.API}/city_coordinates?city=${this.city}`, {responseType:'json'})
    }

    update_municipality(updateObj) {
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid)/*.append('x-role', this.role)*/;
        console.log(updateObj)
        return this.httpClient.post<[object]>(`${this.API}/admin/edit_city`,
            {"boundaries":updateObj},
            {
                headers: reqheaders
            })
            // this.usersChanged.next("userEdited");

    }
}
