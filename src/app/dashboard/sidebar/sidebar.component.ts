import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
}
export const ROUTES: RouteInfo[] = [
    { path: 'home', title: 'DASHBOARD.DASHB',  icon: 'dashboard'},
    { path: 'users', title: 'DASHBOARD.USERS',  icon:'people'},
    { path: 'departments', title: 'DASHBOARD.DEPARTMENTS',  icon:'build'},
    { path: 'boundaries', title: 'DASHBOARD.BOUNDARIES',  icon:'map'},
    { path: 'policy', title: 'DASHBOARD.POLICIES',  icon:'bubble_chart'},
    // { path: 'maps', title: 'Maps',  icon:'library_books'},
    // { path: 'notifications', title: 'Notifications',  icon:'notifications'},
    // { path: 'upgrade', title: 'Upgrade to PRO',  icon:'unarchive'},
];


@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})

export class SidebarComponent implements OnInit {
    @Input() isToggled: string;
    userRoles = [];
    selectedRole:string;

    constructor() { }

    menuItems: any[];
    ngOnInit() {
        this.userRoles =  sessionStorage.getItem('role').split(',');
        this.selectedRole = this.userRoles[0];
        console.log(this.userRoles);
        this.menuItems = ROUTES.filter(menuItem => menuItem);
        // console.log(this.menuItems);
        // console.log(this.isToggled);
    }

    selectRole(role){
        console.log(role);
        this.selectedRole == role ? this.selectedRole = '': this.selectedRole = role ;
        // if (this.selectedRole == role)
        // this.selectedRole = role;
    }
}
