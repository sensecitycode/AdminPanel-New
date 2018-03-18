import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IssuesService } from '../issues.service';
import { TranslationService } from '../../../shared/translation.service';

import { ToastrService } from 'ngx-toastr';

import * as L from 'leaflet';
import 'leaflet.markercluster';
import * as UntypedL from 'leaflet/dist/leaflet-src'
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers';

import * as moment from 'moment';


@Component({
    selector: 'app-display-issue',
    templateUrl: './display-issue.component.html',
    styleUrls: ['./display-issue.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class DisplayIssueComponent implements OnInit {
    fetch_params = {};
    issue = {};


    mapInit:object;
    markerClusterData: any[] = [];
    markerClusterOptions: L.MarkerClusterGroupOptions;
    markerClusterGroup: L.MarkerClusterGroup;
    issueZoom:number ;
    issueCenter: L.LatLng
    mapLayers = [];
    layersControl = {};

    constructor(private issuesService: IssuesService, private translationService: TranslationService, private toastr: ToastrService, private activatedRoute:ActivatedRoute) { }

    ngOnInit() {
        // let issue_id = this.activatedRoute.snapshot.url[0].path;
        this.fetch_params = {
            bug_id: this.activatedRoute.snapshot.url[0].path
        }
        this.fetchIssues()

        this.mapInit = {
            layers: [
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>' })
            ],
            zoom: 12,
            center: L.latLng(38.248028 , 21.7583104)
        };
    }



    fetchIssues() {
        this.issuesService.fetch_issues(this.fetch_params)
        .subscribe(
            data => {
                this.issue = data[0];
                console.log(this.issue);
                this.displayIssuesOnMap(data[0]);
            },
            error => { this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})},
            () => {}
        )
    }

    displayIssuesOnMap(issue) {
        let icon:string;

        // for (let [index, issue] of issues.entries()) {
        this.issue['created_ago'] = moment(new Date(issue.create_at)).fromNow();
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

        this.mapLayers.push(issueMarker)

        this.issueZoom = 17;
        this.issueCenter = L.latLng([issue.loc.coordinates[1],issue.loc.coordinates[0]])
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


}
