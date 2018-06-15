import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    role: [string];
}
export const ROUTES: RouteInfo[] = [
    { path: 'home', title: 'DASHBOARD.DASHB',  icon: 'dashboard', role: ['cityAdmin']},
    { path: 'users', title: 'DASHBOARD.USERS',  icon:'people', role: ['cityAdmin']},
    { path: 'departments', title: 'DASHBOARD.DEPARTMENTS',  icon:'build', role: ['cityAdmin']},
    { path: 'boundaries', title: 'DASHBOARD.BOUNDARIES',  icon:'map', role: ['cityAdmin']},
    { path: 'policy', title: 'DASHBOARD.POLICIES',  icon:'bubble_chart', role: ['cityAdmin']},
    { path: 'issues', title: 'DASHBOARD.ISSUES', icon:'tv', role: ['cityManager','departmentAdmin','departmentUser']},
    { path: 'search_issues', title: 'SEARCH', icon:'search', role: ['cityManager','departmentAdmin','departmentUser']},
    { path: 'statistics', title: 'DASHBOARD.STATISTICS', icon:'show_chart', role: ['cityManager']},
];


@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})

export class SidebarComponent implements OnInit {
    @Input() isToggled: boolean;
    userRoles = [];
    selectedRole:string;

    constructor(private activatedRoute:ActivatedRoute) { }

    menuItems: any[];
    ngOnInit() {
        this.userRoles =  sessionStorage.getItem('role').split(',');
        // if (this.activatedRoute.children[0].routeConfig.path != 'account') {
        //     let routeIndex = ROUTES.map((o) => o.path).indexOf(this.activatedRoute.children[0].routeConfig.path);
        //     this.selectedRole = this.userRoles[this.userRoles.indexOf(ROUTES[routeIndex].role)];
        //
        // } else {
        //     this.selectedRole = this.userRoles[0]
        // }

        if (this.activatedRoute.children[0] && (this.activatedRoute.children[0].routeConfig.path == 'issues' || this.activatedRoute.children[0].routeConfig.path == 'search_issues') ) {
            if (this.userRoles.includes('cityManager')) {this.selectedRole = 'cityManager'}
            else if (this.userRoles.includes('departmentAdmin')) {this.selectedRole = 'departmentAdmin'}
            else {this.selectedRole = 'departmentUser'}
        }
        else if (this.activatedRoute.children[0] && this.activatedRoute.children[0].routeConfig.path != 'account') {
            let routeIndex = ROUTES.map((o) => o.path).indexOf(this.activatedRoute.children[0].routeConfig.path);
            this.selectedRole = ROUTES[routeIndex].role[0];
        }
        else {
            this.selectedRole = this.userRoles[0]
        }


        this.menuItems = ROUTES.filter(menuItem => menuItem);
    }

    selectRole(role){
        this.selectedRole == role ? this.selectedRole = '': this.selectedRole = role ;
        // if (this.selectedRole == role)
        // this.selectedRole = role;
    }
}
