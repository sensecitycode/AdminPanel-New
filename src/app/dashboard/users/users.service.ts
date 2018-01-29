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
                error => {console.log('error occured populating UserArray')},
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
        console.log(user);
        user.city = this.city;
        console.log(user);

        const reqheaders = new HttpHeaders().set('x-uuid', this.uuid)/*.append('x-role', this.role)*/;
        const addUser = this.httpClient.post<[object]>(`https://apitest.sense.city:4443/api/1.0/admin/users`,
            {
                headers: reqheaders
            })
            .subscribe(
                data => { data},
                error => {alert("Adding Users Service not working!");},
                () =>
                    {
                    clearTimeout(addUser_canc);
                    this.usersChanged.next("userAdded");
                    }
            )

        let addUser_canc = setTimeout(() => {
           addUser.unsubscribe();
           alert("Adding Users Service not working!");
        }, 10000);
    }





    edit_user(originalUsername, editedData) {
        var indexOfEdit = this.users.findIndex(i => i.username == originalUsername);
        // console.log(this.users);
        // console.log(indexOfEdit);
        // console.log(originalUsername);
        console.log(editedData);

        this.usersChanged.next("userEdited");
        this.users[indexOfEdit].username = editedData.username;
        this.users[indexOfEdit].email = editedData.email;
        console.log(this.users[indexOfEdit]);
    }
}
