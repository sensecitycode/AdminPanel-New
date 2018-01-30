import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { mergeMap } from 'rxjs/operators';
import { TranslationService } from '../../shared/translation.service';
// import { Router, ActivatedRoute } from '@angular/router';


@Injectable()
export class UsersService {

    constructor(private httpClient: HttpClient, private translationService:TranslationService) { }


    role:string;
    uuid:string;
    city:string;


    private roleslist = [];
    private users = [];
    private userDetails:[object];
    usersChanged = new Subject();


    populate_userArray() {
        console.log("populate_userArray()");
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid)/*.append('x-role', this.role)*/;
        const fetchUsers = this.httpClient.get<[object]>(`https://apitest.sense.city:4443/api/1.0/admin/users`,
            {
                headers: reqheaders
            })
            .subscribe(
                data => { this.users = data;},
                error => {console.log('error occured populating UserArray');},
                () =>
                    {
                    clearTimeout(fetchUsers_canc);
                    this.usersChanged.next("userArrayPopulated");
                    }
            )

        let fetchUsers_canc = setTimeout(() => {
           fetchUsers.unsubscribe();
           alert("Fetch Users Service not working!");
        }, 10000);
    }

    get_userDetails (username) {
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid);
        const fetchUserDetails = this.httpClient.get<[object]>(`https://apitest.sense.city:4443/api/1.0/admin/user/${username}`,
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
        const fetchUserRoles = this.httpClient.get<[object]>(`https://apitest.sense.city:4443/api/1.0/admin/roles`,
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



    add_user(user) {
      user.city = this.city;
      const reqheaders = new HttpHeaders().set('x-uuid', this.uuid)/*.append('x-role', this.role)*/;
      return this.httpClient.post<[object]>(`https://apitest.sense.city:4443/api/1.0/admin/add_user`,
        user,
        {
          headers: reqheaders
        })
    }


    edit_user(user) {
        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid)/*.append('x-role', this.role)*/;
        return this.httpClient.post<[object]>(`https://apitest.sense.city:4443/api/1.0/admin/edit_user`,
          user,
          {
            headers: reqheaders
          })
          // this.usersChanged.next("userEdited");
      }

}
