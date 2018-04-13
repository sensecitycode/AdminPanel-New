import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRoute } from '@angular/router';

@Injectable()
export class RoleGuardService implements CanActivate {

  constructor(private router: Router, private route:ActivatedRoute) { }

  canActivate() {
    console.log("Role Guard");

    if (sessionStorage.getItem('role').split(',').includes('cityAdmin')) {
        // console.log('cityAdmin dashboard')
        // console.log(this.route)
    } else {
        // console.log('issues dashboard')
        // console.log(this.route)
        this.router.navigate(['dashboard/issues'])

    }
    return true;


}


}
