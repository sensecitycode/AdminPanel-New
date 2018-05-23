import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';



@Injectable()
export class AuthService {

    constructor(private httpClient: HttpClient, private router: Router) {}

    API:string;

    public isAuthenticated(): boolean {
        const uuid = sessionStorage.getItem('uuid');
        const role = sessionStorage.getItem('role');
        if (uuid && role) {
            return true;
        }
        return false;
    }

    login(loginData) {
        return this.httpClient.post<[object]>(`${this.API}/login`,
            loginData,
            {responseType:'json'})
    }

    logout() {
        sessionStorage.clear();
        this.router.navigate(['/login']);
    }
}
