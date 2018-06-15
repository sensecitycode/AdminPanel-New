import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {

    constructor(private router: Router, private auth:AuthService) { }

    canActivate() {
        if (this.auth.isAuthenticated())
        {
            return true;
        }

        this.router.navigate(['/login']);
        return false;
    }
}
