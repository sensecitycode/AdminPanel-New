import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { TranslationService } from '../../shared/translation.service';
import { ToastrService } from 'ngx-toastr';

// import { Router, ActivatedRoute } from '@angular/router';

@Injectable()
export class UsersService {

    constructor(private httpClient: HttpClient, private translationService:TranslationService, private toastr: ToastrService) { }


    role:string;
    uuid:string;
    city:string;
    email:string;
    position:string;
    username:string;
    API:string;
    private roleslist = [];
    private users = [];
    usersChanged = new Subject();


    populate_userArray() {
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid)/*.append('x-role', this.role)*/;
        const fetchUsers = this.httpClient.get<[object]>(`${this.API}/admin/users`,
            {
                headers: reqheaders
            })
            .subscribe(
                data => { this.users = data;},
                error => {
                    this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                },
                () =>
                    {
                    // clearTimeout(fetchUsers_canc);
                    this.usersChanged.next("userArrayPopulated");
                    }
            )

        // let fetchUsers_canc = setTimeout(() => {
        //    fetchUsers.unsubscribe();
        //    alert("Fetch Users Service not working!");
        // }, 10000);
    }

    get_userDetails (username) {
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid);
        return this.httpClient.get<[object]>(`${this.API}/admin/user/${username}`,
            {
                headers: reqheaders
            })
    }

    get_userRoles() {
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid);
        const fetchUserRoles = this.httpClient.get<[object]>(`${this.API}/admin/roles`,
            {
                headers: reqheaders
            })
            .subscribe(
                data => { this.roleslist = data},
                error => {},
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



    add_user(user) {
      user.city = this.city;
      const reqheaders = new HttpHeaders().set('x-uuid', this.uuid)/*.append('x-role', this.role)*/;
      return this.httpClient.post<[object]>(`${this.API}/admin/add_user`,
        user,
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

    change_user_pass(pass_object) {
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid)/*.append('x-role', this.role)*/;
        return this.httpClient.post(`${this.API}/admin/change_user_pass`, pass_object , { headers: reqheaders})
    }

}
