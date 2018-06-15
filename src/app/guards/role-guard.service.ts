import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRoute } from '@angular/router';

@Injectable()
export class RoleGuardService implements CanActivate {

  constructor(private router: Router, private route:ActivatedRoute) { }

  canActivate() {

    if (sessionStorage.getItem('role').split(',').includes('cityAdmin')) {
    } else {
        this.router.navigate(['dashboard/issues'])

    }
    return true;


}


}
