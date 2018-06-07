import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';



import { IssuesService } from '../issues.service';
import { TranslationService } from '../../../shared/translation.service';
import { DepartmentsService } from '../../departments/departments.service';


import { ToastrService } from 'ngx-toastr';

import * as L from 'leaflet';
import 'leaflet.gridlayer.googlemutant';

import 'leaflet.markercluster';

// import * as L from 'leaflet/dist/leaflet';
// import { AwesomeMarkers } from 'leaflet.awesome-markers/dist/leaflet.awesome-markers';
// import 'leaflet.markercluster/dist/leaflet.markercluster';

import * as UntypedL from 'leaflet/dist/leaflet-src'
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers';

import * as moment from 'moment';

import pdfMake from 'pdfmake/build/pdfmake.min'
import pdfFonts from 'pdfmake/build/vfs_fonts'
pdfMake.vfs = pdfFonts.pdfMake.vfs


@Component({
    selector: 'app-list-issues',
    templateUrl: './list-issues.component.html',
    styleUrls: ['./list-issues.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class ListIssuesComponent implements OnInit {
    initial_language = this.translationService.getLanguage()

    issuesPerPage = this.issuesService.issuesViewPerPage;
    sorting_value = this.issuesService.issuesSorting;
    actionGroupSelected = this.issuesService.actionGroupSelect;

    issue_types = [
        {type: "all", icon: "fa fa-home"},
        {type: "garbage", icon: "fa fa-trash-o"},
        {type: "lighting", icon: "fa fa-lightbulb-o"},
        {type: "plumbing", icon: "fa fa-umbrella"},
        {type: "road-constructor", icon: "fa fa-road"},
        {type: "protection-policy", icon: "fa fa-shield"},
        {type: "green", icon: "fa fa-tree"},
        {type: "environment", icon: "fa fa-leaf"}
    ]
    bulk_checked = false;
    resolvedStatusList = ["FIXED","INVALID","WONTFIX"];

    fetch_params = {};
    issues = [];
    mapInit:object;
    markerClusterData: any[] = [];
    markerClusterOptions: L.MarkerClusterGroupOptions;
    markerClusterGroup: L.MarkerClusterGroup;

    subscriptions = new Subscription();
    mapLayers = [];
    layersControl = {};
    issueZoom:number ;
    issueCenter: L.LatLng

    userRoles = sessionStorage.getItem('role').split(',')
    constructor(private issuesService: IssuesService,
                private translationService: TranslationService,
                private toastr: ToastrService,
                private formBuilder: FormBuilder,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private depServ: DepartmentsService) { }

    bulkEditForm: FormGroup;

    ngOnInit() {

        //get departments name to replace departments_ids
        let departments = []
        let userdepartments = [];

        //initial component loading
        //
        if (this.issuesService.departments.length == 0) {
            this.subscriptions.add(this.depServ.departmentsChanged.subscribe(
                (status:string) => {
                if (status == "departmentsArrayPopulated"){
                    departments = this.depServ.return_departmentsArray()
                    // console.log(departments)
                    this.issuesService.departments = []
                    if (this.issuesService.departments_ids.length > 0) {

                        for (let dep_id of this.issuesService.departments_ids) {
                            this.issuesService.departments.push(departments.find((dep) => dep.departmentID == dep_id)['component_name'])
                            userdepartments.push(departments.find((dep) => dep.departmentID == dep_id)['component_name'])
                        }
                    } else {
                        // console.log('Τμήμα επίλυσης προβλημάτων')
                        // this.issuesService.departments.push('Τμήμα επίλυσης προβλημάτων')
                        // userdepartments.push('Τμήμα επίλυσης προβλημάτων')
                        this.issuesService.departments.push(this.depServ.control_department)
                        userdepartments.push(this.depServ.control_department)

                    }
                    // console.log(userdepartments)
                    // console.log(userdepartments.join('&'))
                    this.fetch_params = {
                        departments: userdepartments.join('|'),
                        image_field: '0',
                        limit: this.issuesPerPage,
                        sort: this.sorting_value,
                        startdate: '2016-08-01',
                        // status: 'CONFIRMED|IN_PROGRESS'
                    }

                    if (this.issuesService.issuesSelected != 'all')  this.fetch_params['issue'] = this.issuesService.issuesSelected;
                    this.onActionGroupSelected(this.actionGroupSelected)

                    // this.fetchIssues()
                }
            }))
            this.depServ.populate_departmentsArray()

        }

        //component re-loading
        //
        if (this.issuesService.departments.length > 0) {
            this.fetch_params = {
                departments: this.issuesService.departments.join('|'),
                image_field: '0',
                limit: this.issuesPerPage,
                sort: this.sorting_value,
                startdate: '2016-08-01',
                // status: 'CONFIRMED|IN_PROGRESS'
            }

            if (this.issuesService.issuesSelected != 'all')  this.fetch_params['issue'] = this.issuesService.issuesSelected;
            this.onActionGroupSelected(this.actionGroupSelected)

            // this.fetchIssues()
        }

        let openStreetMaps = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>' })

        let googleRoadMap = UntypedL.gridLayer.googleMutant({
            type: 'roadmap',
            maxZoom: 18
        })
        googleRoadMap.addGoogleLayer('TrafficLayer');

        let googleHybrid = UntypedL.gridLayer.googleMutant({
            type: 'hybrid',
            maxZoom: 18
        })

        this.mapInit = {
            layers: [openStreetMaps],
            zoom: 12,
            center: L.latLng(38.248028 , 21.7583104)
        };

        this.layersControl['baseLayers'] = {
            'Open Street Maps': openStreetMaps,
            'Google Maps Traffic': googleRoadMap,
            'Google Maps Satellite': googleHybrid,
        }

        this.bulkEditForm = new FormGroup({
            status: new FormControl('RESOLVED'),
            resolution: new FormControl('FIXED'),
        })


    }

    onMapReady(map: L.Map){
        console.log("map ready")
        // console.log(map);
        this.issuesService.fetch_fixed_points()
        .subscribe(
            data => {
                // console.log(data);
                let StaticGarbageMarkers:L.Layer[] = []
                let StaticLightingMarkers:L.Layer[] = []
                for (let FixPnt of data) {
                    if (FixPnt.type == 'garbage') {
                        let AwesomeMarker;
                        switch (FixPnt.notes[0].ANAKIKLOSI) {
                            case '0':
                                AwesomeMarker = UntypedL.AwesomeMarkers.icon({
                                    icon: 'fa-trash-o',
                                    markerColor: 'green',
                                    prefix: 'fa',
                                    className: 'awesome-marker awesome-marker-square'
                                });
                                break;
                            case '1':
                                AwesomeMarker = UntypedL.AwesomeMarkers.icon({
                                    icon: 'fa-trash-o',
                                    markerColor: 'blue',
                                    prefix: 'fa',
                                    className: 'awesome-marker awesome-marker-square'
                                });
                        }
                        let TrashMarker = new L.Marker([FixPnt.loc.coordinates[1],FixPnt.loc.coordinates[0]], {icon: AwesomeMarker})
                        StaticGarbageMarkers.push(TrashMarker);
                    }

                    if (FixPnt.type == 'fotistiko') {
                        let AwesomeMarker =  UntypedL.AwesomeMarkers.icon({
                            icon: 'fa-lightbulb-o',
                            markerColor: 'orange',
                            prefix: 'fa',
                            className: 'awesome-marker awesome-marker-square'
                        });
                        let LightMarker = new L.Marker([FixPnt.loc.coordinates[1],FixPnt.loc.coordinates[0]], {icon: AwesomeMarker})
                        StaticLightingMarkers.push(LightMarker);
                    }
                }

                // console.log(StaticGarbageMarkers)
                this.markerClusterData =  StaticLightingMarkers.concat(StaticGarbageMarkers);
                this.markerClusterOptions = {
                    disableClusteringAtZoom: 19,
                    animateAddingMarkers: false,
                    spiderfyDistanceMultiplier: 2,
                    singleMarkerMode: false,
                    showCoverageOnHover: true,
                    chunkedLoading: true
                }

                let overlayTitle = "<span class='fa fa-map-marker fa-2x'></span> " + this.translationService.get_instant('DASHBOARD.FIXED_POINTS');

                this.layersControl['overlays'][overlayTitle] = this.markerClusterGroup

                // this.layersControl = {
            	// 	overlays: {
            	// 		"<span class='fa fa-trash-o fa-2x'></span> Static Points": this.markerClusterGroup,
            	// 		// StaticLightingMarkers: StaticLightingMarkers
            	// 	}
            	// };
            },
            error => { this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})},
            () => {    }
        )
        // map.on ('layeradd', (ev:L.LeafletMouseEvent) => {console.log(ev)});
        // map.on ('click', (ev:L.LeafletMouseEvent) => {console.log(ev)});
    }


    markerClusterReady(group: L.MarkerClusterGroup) {
        // console.log(group)
        this.markerClusterGroup = group;
    }

    onActionGroupSelected(selection) {
        this.issuesService.actionGroupSelect = selection

        console.log(this.issuesService.actionGroupSelect)
        if (selection == 'DEPARTMENT_ISSUES') {
            this.fetch_params['status'] = 'CONFIRMED|IN_PROGRESS'
            this.fetch_params['departments'] = this.issuesService.departments.join('|')
        }
        if (selection == 'DEPARTENT_COMPLETED_ISSUES') {
            this.fetch_params['status'] = 'RESOLVED'
            this.fetch_params['departments'] = this.issuesService.departments.join('|')
        }
        if (selection == 'OTHER_DEP_ISSUES') {
            this.fetch_params['status'] = 'IN_PROGRESS'

            let other_departments = this.depServ.return_departmentsArray().map(el => el.component_name)
            this.issuesService.departments.forEach(dep => {
                other_departments.splice(other_departments.indexOf(dep), 1);
            })

            this.fetch_params['departments'] = other_departments.join('|')
        }
        // console.log(this.fetch_params['status'])
        this.fetchIssues()
    }

    printRequestGuard = false;
    fetchIssues4Printing() {
        this.printRequestGuard = true;
        console.log('print')
        let print_params = JSON.parse(JSON.stringify(this.fetch_params))
        delete print_params['limit']
        print_params['image_field'] = 1
        console.log(print_params)
        console.log(this.fetch_params)
        let print_issues = []
        this.issuesService.fetch_issues(print_params)
        .subscribe(
            data => {
                print_issues = data;
            },
            error => {
                this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true}),
                this.printRequestGuard = false;
            },
            () => {
                this.printRequestGuard = false;

                console.log(print_issues);
                let docDefinition = {
                    info: {
                        title:`Issues (${moment(new Date()).format('DD-MM-YYYY')})`,
                        creator:`Sense.City`
                    },
                    pageOrientation: 'landscape',
                    pageMargins: [ 15, 15, 15, 15 ],
                    content: [
                        {text: `Sense.City ${this.translationService.get_instant('ROLE_ACTIONS.cityManager')} (${moment(new Date()).format('DD-MM-YYYY')})`, style: 'header'},
                        {text:`${this.translationService.get_instant('DASHBOARD.DEPARTMENTS')}: ${this.issuesService.departments.join(', ')}`, style: 'subheader'},
                        {text:`${this.translationService.get_instant('CATEGORY')}: ${this.translationService.get_instant('DASHBOARD.'+this.issuesService.actionGroupSelect)}`,  style: 'subheader'},
                        {style:'tableExample', table: {
                            // widths: ['auto', 'auto','auto','auto','*','auto'],
                            body: [
                                [{text: 'ID', style: 'tableHeader'}, {text: this.translationService.get_instant('ISSUE_TYPE'), style: 'tableHeader'}, {text: this.translationService.get_instant('DASHBOARD.REPORTED'), style: 'tableHeader'}, {text: this.translationService.get_instant('DASHBOARD.FULL_NAME'), style: 'tableHeader'}, {text: this.translationService.get_instant('SIGNUP.CONTACT_INFO'), style: 'tableHeader'}, {text: this.translationService.get_instant('SIGNUP.ADDRESS'), style: 'tableHeader'}]
                            ]
                        }}
                    ],
                    styles: {
                        header: {
                            fontSize: 15,
                            bold: true,
                            margin: [0, 0, 0, 10]
                        },
                        subheader: {
                            fontSize: 13,
                            margin: [0, 0, 0, 8]
                        },
                        tableExample: {
                            margin: [0, 0, 0, 8],
                            alignment: 'center'
                        },
                        tableHeader: {
                            bold: true,
                            fontSize: 13,
                            alignment: 'center'
                        }
                    }
                };

                print_issues.forEach(issue => {
                    docDefinition.content[3]['table'].body.push([issue.bug_id, issue.value_desc, moment(new Date(issue.create_at)).format('DD-MM-YYYY HH:MM'), issue.name, `${issue.email}\n${issue.phone}`, issue.bug_address ])
                })
                // console.log(docDefinition.content[3]['table'].body)
                pdfMake.createPdf(docDefinition).open();
            }
        )



    }

    searchAddress(address) {
        if (address != '')
        {
            this.issuesService.get_address_coordinates(address)
                .subscribe(
                    data =>
                    {
                        if (data.results.length > 0) {
                            this.issueCenter = data.results[0].geometry.location
                            this.issueZoom = 17
                        } else {
                            this.toastr.error(this.translationService.get_instant('ADDRESS_NOT_FOUND_MSG'), this.translationService.get_instant('ERROR'), {timeOut:6000, progressBar:true, enableHtml:true})
                        }
                    },
                    error => this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                )
        }
    }

    changePageSize(issuesPerPage) {
        if (this.fetch_params['limit'] != issuesPerPage){
            this.fetch_params['limit'] = issuesPerPage;
            console.log(this.fetch_params);
            this.fetchIssues()
        }
    }

    changeIssueSorting(sort_select) {
        if (this.fetch_params['sort'] != sort_select){
            this.fetch_params['sort'] = sort_select;
            console.log(this.fetch_params);
            this.issuesService.issuesSorting = sort_select;
            // this.fetchIssues()
        }
    }

    changeIssueType(type_select) {
        if (this.fetch_params['issue'] != type_select){

            if (type_select == 'all') {
                // this.issuesService.issuesSelected = '';
                // this.fetch_params['issue'] = undefined;
                delete this.fetch_params['issue'];
            } else {
                this.fetch_params['issue'] = type_select;
            }

            this.issuesService.issuesSelected = type_select;

            console.log(this.fetch_params);

            // this.fetchIssues()
        }
    }

    onDisplayIssueDetails(issue) {
        console.log(issue);
        this.router.navigate([issue.bug_id], {relativeTo: this.activatedRoute});
    }



    displayIssuesOnMap(issues) {
        this.mapLayers = [];
        let allIssueMarkers = [];
        let icon:string;
        // for (let [index, issue] of issues.entries()) {
        issues.forEach((issue, index) => {
            this.issues[index].created_ago = moment(new Date(issue.create_at)).locale(this.initial_language).fromNow();

            icon = this.issuesService.get_issue_icon(issue.issue)
            let AwesomeMarker =  UntypedL.AwesomeMarkers.icon({
                icon: icon,
                markerColor: 'red',
                prefix: 'fa',
            });

            let issueMarker = new L.Marker([issue.loc.coordinates[1],issue.loc.coordinates[0]], {icon: AwesomeMarker, alt:issue.bug_id})
            issueMarker.on('click', ev => {this.router.navigate([ev.target.options.alt], {relativeTo: this.activatedRoute});})

            allIssueMarkers.push(issueMarker)
        })
        console.log(allIssueMarkers.length)
        this.mapLayers = allIssueMarkers
    }

    fetchIssues() {
        this.issuesService.fetch_issues(this.fetch_params)
        .subscribe(
            data => {
                this.issues = data;
                console.log(this.issues);
                this.displayIssuesOnMap(data);
            },
            error => { this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})},
            () => {}
        )
    }

    onBulkSliderChange() {
        this.issuesToBeBulkEdited = []
    }

    issuesToBeBulkEdited = []
    onBulkEditChange(event, issue) {
        if(event.checked) {
           this.issuesToBeBulkEdited.push(issue)
         } else {

           this.issuesToBeBulkEdited.splice(this.issuesToBeBulkEdited.indexOf(issue), 1);
         }
     }

    onSubmitBulkEdit() {
        this.subscriptions.add(
            this.issuesService.updateIssueStatus
            .subscribe((id) => {
                console.log(id)
                if (id == this.issuesToBeBulkEdited[this.issuesToBeBulkEdited.length-1].bug_id) {
                    console.log("last")
                    this.fetchIssues()
                    this.bulk_checked = false
                }
            })
        )

        console.log(this.issuesToBeBulkEdited)
        this.issuesToBeBulkEdited.forEach((issue, index, array) => {
            console.log(issue)
            let update_obj = {
                "ids": [issue.bug_id],
                "status": this.bulkEditForm.get('status').value,
                "component": issue.bug_component,
                "priority": issue.bug_priority,
                "severity": issue.bug_severity,
                "cf_city_address": issue.bug_address,
                "lat": issue.loc.coordinates[1],
                "lng": issue.loc.coordinates[0]
            }

            if (this.bulkEditForm.get('status').value == 'RESOLVED') update_obj['resolution'] = this.bulkEditForm.get('resolution').value

            if (this.bulkEditForm.get('status').value == 'CONFIRMED') update_obj['component'] = this.depServ.control_department

            console.log(update_obj)


            this.issuesService.update_bug(update_obj, '', new FormData())

            // this.bulk_checked = false
        })
    }

    ngOnDestroy () {
        this.subscriptions.unsubscribe()
    }



}
