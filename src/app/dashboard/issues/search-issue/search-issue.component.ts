import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';




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


@Component({
    selector: 'app-search-issue',
    templateUrl: './search-issue.component.html',
    styleUrls: ['./search-issue.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class SearchIssueComponent implements OnInit {


    constructor(private issuesService: IssuesService,
                private translationService: TranslationService,
                private toastr: ToastrService,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private depServ: DepartmentsService,
                private formBuilder: FormBuilder) { }

    initial_language = this.translationService.getLanguage()
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

    searchForm: FormGroup;
    advancedSearchForm: FormGroup;
    issueTypesList = [
        {type: "garbage", icon: "fa fa-trash-o"},
        {type: "lighting", icon: "fa fa-lightbulb-o"},
        {type: "road-constructor", icon: "fa fa-road"},
        {type: "protection-policy", icon: "fa fa-shield"},
        {type: "green", icon: "fa fa-tree"},
        {type: "environment", icon: "fa fa-leaf"}
    ]
    statusList = [
        {type: "CONFIRMED", icon: "fa fa-exclamation-circle"},
        {type: "IN_PROGRESS", icon: "fa fa-question-circle"},
        {type: "RESOLVED", icon: "fa fa-check-circle"},
        {type: "ANONYMOUS", icon: "fa fa-user-circle"},
    ];
    priorityStatusList = ["High","Normal","Low"];
    severityStatusList = ["critical","major","normal","minor","trivial","enhancement"]





    ngOnInit() {
        this.searchForm = this.formBuilder.group({
            'bug_id': [''],
            'mobile': [''],
            'email': [''],
        })

        this.advancedSearchForm = this.formBuilder.group({
            'issue': [''],
            'status': [''],
            'severity': [''],
            'priority': [''],
            'bug_id': [''],
            'mobile': [''],
            'email': [''],
            'startdate': [''],
            'enddate': ['']
        })

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
            zoom: this.issuesService.cityCenter.zoom,
            center: L.latLng(this.issuesService.cityCenter.lat , this.issuesService.cityCenter.lng)
        };

        this.layersControl['baseLayers'] = {
            'Open Street Maps': openStreetMaps,
            'Google Maps Traffic': googleRoadMap,
            'Google Maps Satellite': googleHybrid,
        }
    }

    searchIssue() {
        this.issuesService.fetch_issues(this.searchForm.value)
            .subscribe(
                (data) =>
                {
                    this.issues = data
                    this.displayIssuesOnMap(data);
                },
                (error) => this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
            )
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
            issueMarker.on('click', ev => {this.router.navigate(['../issues', ev.target.options.alt], {relativeTo: this.activatedRoute});})
            allIssueMarkers.push(issueMarker)
        })
        this.mapLayers = allIssueMarkers
    }

    onMapReady(map: L.Map){
        this.issuesService.fetch_fixed_points()
        .subscribe(
            data => {
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
            error => { },
            () => {  }
        )
    }


    markerClusterReady(group: L.MarkerClusterGroup) {
        this.markerClusterGroup = group;
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

    onDisplayIssueDetails(issue) {
        this.router.navigate(['../issues', issue.bug_id], {relativeTo: this.activatedRoute});
    }

    ngOnDestroy () {
        this.subscriptions.unsubscribe()
    }

}
