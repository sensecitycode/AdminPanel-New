import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';


import { IssuesService } from '../issues.service';
import { TranslationService } from '../../../shared/translation.service';

import { ToastrService } from 'ngx-toastr';

import * as L from 'leaflet';
import 'leaflet.markercluster';

// import * as L from 'leaflet/dist/leaflet';
// import { AwesomeMarkers } from 'leaflet.awesome-markers/dist/leaflet.awesome-markers';
// import 'leaflet.markercluster/dist/leaflet.markercluster';

import * as UntypedL from 'leaflet/dist/leaflet-src'
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers';

import * as moment from 'moment';


@Component({
    selector: 'app-list-issues',
    templateUrl: './list-issues.component.html',
    styleUrls: ['./list-issues.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class ListIssuesComponent implements OnInit {


    issuesPerPage = this.issuesService.issuesViewPerPage;
    sorting_value = this.issuesService.issuesSorting;
    issue_types = [
        {type: "all", icon: "fa fa-home"},
        {type: "garbage", icon: "fa fa-trash-o"},
        {type: "lighting", icon: "fa fa-lightbulb-o"},
        {type: "road-constructor", icon: "fa fa-road"},
        {type: "protection-policy", icon: "fa fa-shield"},
        {type: "green", icon: "fa fa-tree"},
        {type: "environment", icon: "fa fa-leaf"}
    ]
    fetch_params = {};
    issues = [];
    mapInit:object;
    markerClusterData: any[] = [];
    markerClusterOptions: L.MarkerClusterGroupOptions;
    markerClusterGroup: L.MarkerClusterGroup;

    mapLayers = [];
    layersControl = {};

    constructor(private issuesService: IssuesService,
                private translationService: TranslationService,
                private toastr: ToastrService,
                private router: Router,
                private activatedRoute: ActivatedRoute) { }

    ngOnInit() {
        this.fetch_params = {
            departments: 'Τμήμα επίλυσης προβλημάτων',
            image_field: '0',
            limit: this.issuesPerPage,
            sort: this.sorting_value,
            startdate: '2016-08-01',
            status: 'CONFIRMED|IN_PROGRESS'
        }

        if (this.issuesService.issuesSelected != 'all')  this.fetch_params['issue'] = this.issuesService.issuesSelected;
        this.fetchIssues()

        this.mapInit = {
            layers: [
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>' })
            ],
            zoom: 12,
            center: L.latLng(38.248028 , 21.7583104)
        };
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

                this.layersControl = {
            		overlays: {
            			"<span class='fa fa-trash-o fa-2x'></span> Static Points": this.markerClusterGroup,
            			// StaticLightingMarkers: StaticLightingMarkers
            		}
            	};
            },
            error => { this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})},
            () => {    }
        )
        // map.on ('layeradd', (ev:L.LeafletMouseEvent) => {console.log(ev)});
    }


    markerClusterReady(group: L.MarkerClusterGroup) {
        // console.log(group)
        this.markerClusterGroup = group;

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
            this.issues[index].created_ago = moment(new Date(issue.create_at)).fromNow();
            switch (issue.issue) {
                case 'lighting':
                    icon = 'fa-lightbulb-o';
                    break;
                case 'road-constructor':
                    icon = 'fa-road';
                    break;
                case 'garbage':
                    icon = 'fa-trash-o';
                    break;
                case 'green':
                    icon = 'fa-tree';
                    break;
                case 'plumbing':
                    //
                    // not yet supported
                    //
                case 'environment':
                    icon = 'fa-leaf';
                    break;
                case 'protection-policy':
                    icon = 'fa-shield';
                    break;
            }
            let AwesomeMarker =  UntypedL.AwesomeMarkers.icon({
                icon: icon,
                markerColor: 'red',
                prefix: 'fa',
            });

            let issueMarker = new L.Marker([issue.loc.coordinates[1],issue.loc.coordinates[0]], {icon: AwesomeMarker})
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

}
