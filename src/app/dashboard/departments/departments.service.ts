import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { TranslationService } from '../../shared/translation.service';
import { ToastrService } from 'ngx-toastr';
// import { mergeMap } from 'rxjs/operators';
// import { Router, ActivatedRoute } from '@angular/router';


@Injectable()
export class DepartmentsService {

    constructor(private httpClient: HttpClient, private translationService: TranslationService, private toastr: ToastrService) { }


    role:string;
    uuid:string;
    city:string;
    API:string;

    private roleslist = [];
    private users = [];
    private userDetails:[object];
    usersChanged = new Subject();

    private departments = [];
    control_department:string;
    departmentsChanged = new Subject();

    populate_departmentsArray() {
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid)/*.append('x-role', this.role)*/;
        const fetchDepartments = this.httpClient.get<any>(`${this.API}/admin/departments`,
            {
                headers: reqheaders
            })
            .subscribe(
                data => { this.departments = data},
                error => {
                    this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                },
                () =>
                    {
                        this.httpClient.get<any>(`${this.API}/admin/municipality?city=${this.city}`,  {headers: reqheaders})
                        .subscribe(
                            (data) => this.control_department = data[0].control_department,
                            (error) => {
                                this.toastr.error(this.translationService.get_instant('CONTROL_DEP_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true}),
                                this.departmentsChanged.next("departmentsArrayPopulated");
                            },
                            () => {
                                this.departmentsChanged.next("departmentsArrayPopulated");
                            }
                        )
                    }
            )
    }


    return_departmentsArray() {
        return this.departments.slice();
    }

    add_department(department) {
      const reqheaders = new HttpHeaders().set('x-uuid', this.uuid)/*.append('x-role', this.role)*/;
      return this.httpClient.post<[object]>(`${this.API}/admin/add_departments`,
        department,
        {
          headers: reqheaders
        })
    }


}
