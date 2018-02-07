import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
// import { mergeMap } from 'rxjs/operators';
// import { TranslationService } from '../../shared/translation.service';
// import { Router, ActivatedRoute } from '@angular/router';


@Injectable()
export class DepartmentsService {

    constructor(private httpClient: HttpClient) { }


    role:string;
    uuid:string;
    city:string;
    API:string;

    private roleslist = [];
    private users = [];
    private userDetails:[object];
    usersChanged = new Subject();

    private departments = [];
    departmentsChanged = new Subject();

    populate_departmentsArray() {
        console.log("populate_departmentsArray()");
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid)/*.append('x-role', this.role)*/;
        const fetchDepartments = this.httpClient.get<any>(`${this.API}/admin/departments`,
            {
                headers: reqheaders
            })
            .subscribe(
                data => { this.departments = data},
                error => {
                    console.log('error occured populating departmentsArray');
                    alert("Fetch Departments Service not working!");
                },
                () =>
                    {
                    this.departmentsChanged.next("departmentsArrayPopulated");
                    }
            )
    }

    get_userDetails (username) {
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid);
        const fetchUserDetails = this.httpClient.get<[object]>(`${this.API}/admin/user/${username}`,
            {
                headers: reqheaders
            })
            .subscribe(
                data => {this.userDetails = data;},
                error => {console.log('error occured fetching user details')},
                () =>
                    {
                        clearTimeout(fetchUserDetails_canc);
                        this.usersChanged.next("userDetailsFetched");
                    }
            )

        let fetchUserDetails_canc = setTimeout(()=>{
            fetchUserDetails.unsubscribe();
            alert("Fetch User Details Service not working!");
        }, 10000);
    }

    get_userRoles() {
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid);
        const fetchUserRoles = this.httpClient.get<[object]>(`${this.API}/admin/roles`,
            {
                headers: reqheaders
            })
            .subscribe(
                data => { this.roleslist = data; console.log(data)},
                error => {console.log('error occured fetching user roles')},
                () =>
                    {
                        clearTimeout(fetchUserRoles_canc);
                        this.usersChanged.next("userRolesFetched");
                    }
            )

        let fetchUserRoles_canc = setTimeout(()=>{
            fetchUserRoles.unsubscribe();
            alert("Fetch User Roles Service not working!");
        }, 6000);
    }


    return_rolesList() {
        return this.roleslist.slice();
    }

    return_userArray() {
        return this.users.slice();
    }

    return_userDetails() {
        return this.userDetails[0];
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


    edit_user(user) {
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid)/*.append('x-role', this.role)*/;
        return this.httpClient.post<[object]>(`${this.API}/admin/edit_user`,
          user,
          {
            headers: reqheaders
          })
          // this.usersChanged.next("userEdited");
    }

}
