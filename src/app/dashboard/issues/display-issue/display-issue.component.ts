import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import localeEl from '@angular/common/locales/el'
import { ToastrService } from 'ngx-toastr';
import { Lightbox } from 'angular2-lightbox';

import {} from '@types/googlemaps'

import * as L from 'leaflet';
import 'leaflet.gridlayer.googlemutant';
import 'leaflet.markercluster';
import * as UntypedL from 'leaflet/dist/leaflet-src'
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers';

import * as moment from 'moment';

import { TranslationService } from '../../../shared/translation.service';
import { DepartmentsService } from '../../departments/departments.service';

import { IssuesService } from '../issues.service';


@Component({
    selector: 'app-display-issue',
    templateUrl: './display-issue.component.html',
    styleUrls: ['./display-issue.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class DisplayIssueComponent implements OnInit {
    fetch_params = {bug_id: this.activatedRoute.snapshot.url[0].path};
    issue:any = {};
    imageFetchURL:string;
    issueImage: [{
        src:string,
        caption:string,
        thumb:string
    }]
    imageBroken = false;
    issueIcon:string;
    enableAdmin = false;
    requestGuard = true;
    adminGuard = true;

    activeMap = 'leaflet';
    @ViewChild('gmap1') gmapElement: any;


    mapInit:object;
    markerClusterData: any[] = [];
    markerClusterOptions: L.MarkerClusterGroupOptions;
    markerClusterGroup: L.MarkerClusterGroup;
    issueZoom:number ;
    issueCenter: L.LatLng
    mapLayers = [];
    layersControl = {};

    subscriptions = new Subscription();
    departments:any[];
    issueAdminForm: FormGroup;
    statusList = ["CONFIRMED","IN_PROGRESS","RESOLVED"];
    resolvedStatusList = ["FIXED","INVALID","WONTFIX","DUPLICATE"];
    priorityStatusList = ["High","Normal","Low"];
    severityStatusList = ["critical","major","normal","minor","trivial","enhancement"]


    constructor(private formBuilder: FormBuilder,
                private issuesService: IssuesService,
                private translationService: TranslationService,
                private toastr: ToastrService,
                private activatedRoute:ActivatedRoute,
                private lightbox: Lightbox,
                private depServ: DepartmentsService) { }


    ngOnInit() {

        this.imageFetchURL = this.issuesService.API + "/image_issue?bug_id=" + this.fetch_params.bug_id;
        this.issueImage = [{
           src: this.imageFetchURL+"&resolution=full",
           caption: 'caption',
           thumb: this.imageFetchURL+"&resolution=medium"
        }];
        // this.fetchFullIssue()
        //
        //
        this.departments = this.depServ.return_departmentsArray()

        if (this.issuesService.departments.length == 0) {
            this.subscriptions.add(this.depServ.departmentsChanged.subscribe(
                (status:string) => {
                if (status == "departmentsArrayPopulated"){
                    this.departments = this.depServ.return_departmentsArray();
                    this.issuesService.departments = []
                    if (this.issuesService.departments_ids.length > 0) {

                        for (let dep_id of this.issuesService.departments_ids) {
                            this.issuesService.departments.push(this.departments.find((dep) => dep.departmentID == dep_id)['component_name'])
                        }
                    } else {
                        this.issuesService.departments.push(this.depServ.control_department)
                    }

                    if (!this.issuesService.departments.includes(this.depServ.control_department)) {
                        this.fetch_params['departments'] = this.issuesService.departments.join('|')
                    }

                    this.fetchIssue()
                    this.fetchComments()
                }
            }))
        }

        if (this.departments.length == 0) {
            this.depServ.populate_departmentsArray()
        } else {
            // page comeback with no reload
            if (!this.issuesService.departments.includes(this.depServ.control_department)) {
                this.fetch_params['departments'] = this.issuesService.departments.join('|')
            }
            this.fetchIssue()
            this.fetchComments()
        }

        //
        //
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

        //get departments name for issue edit form
        // this.departments = this.depServ.return_departmentsArray()
        // this.subscriptions.add(this.depServ.departmentsChanged.subscribe(
        //     (status:string) => {
        //     if (status == "departmentsArrayPopulated"){
        //         this.departments = this.depServ.return_departmentsArray();
        //     }
        // }))
        //
        // if (this.departments.length == 0) this.depServ.populate_departmentsArray()
        //

        this.subscriptions.add(this.issuesService.updateIssueStatus.subscribe(
            (status:string) => {
                if (status) {
                    this.requestGuard = false;
                    this.fetchIssue()
                    this.fetchComments()
                }
            }
        ))

        //edit issue form
        this.issueAdminForm = this.formBuilder.group({
            'status': [''],
            'resolution': [''],
            'duplicate': [''],
            'assignee': [''],
            'priority': [''],
            'severity': [''],
            'address': [''],
            'comments': [''],
            'files': ['']
        })

        this.subscriptions.add(this.translationService.languageChanged.subscribe(
            (new_lang: string) => {
                if (this.issue.hasOwnProperty('created_ago')) {
                    this.issue.created_ago = moment(new Date(this.issue.create_at)).locale(new_lang).fromNow()
                }

                this.layersControl['overlays'] = {}
                let overlayTitle = "<span class='fa fa-map-marker fa-2x'></span> " + this.translationService.get_instant('DASHBOARD.FIXED_POINTS');
                this.layersControl['overlays'][overlayTitle] = this.markerClusterGroup
            }
        ))

    }

    //
    //  ISSUE ADMIN FUNCTIONS
    //

    checkStatusValue(event){
        event.value == 'IN_PROGRESS' ? this.issueAdminForm.get('assignee').enable() : this.issueAdminForm.get('assignee').disable()

        if (event.value == 'CONFIRMED')  this.issueAdminForm.patchValue({assignee:this.depServ.control_department})
    }

    uploadFilesFormData: FormData
    fileNamesArray = []
    fileUploadHandler(files: FileList) {

        this.fileNamesArray = [];
        this.uploadFilesFormData = new FormData();

        for (let index = 0; index < files.length; index++)  {
            this.fileNamesArray.push(files[index].name);
            this.uploadFilesFormData.append("file", files[index], files[index].name)
        }
    }

    setAdminInitialForm() {
        this.issueAdminForm.patchValue({
            status:this.issue['status'],
            assignee:this.issue['bug_component'],
            priority:this.issue['bug_priority'],
            severity:this.issue['bug_severity'],
            address:this.issue['bug_address'],
            comments:''
        })
        this.issue['resolution'] != '' ? this.issueAdminForm.patchValue({resolution:this.issue['resolution']}) : this.issueAdminForm.patchValue({resolution:"FIXED"})
        this.issue['status'] == 'IN_PROGRESS' ? this.issueAdminForm.get('assignee').enable() : this.issueAdminForm.get('assignee').disable()

        this.fileNamesArray = [];
        this.uploadFilesFormData = new FormData();

    }

    submitAdmin() {
        let updatedIssue = {
            "ids": [this.issue['bug_id']],
            "status": this.issueAdminForm.get('status').value,
            "priority": this.issueAdminForm.get('priority').value,
            "severity": this.issueAdminForm.get('severity').value,
            "component": this.issueAdminForm.get('assignee').value,
            "cf_city_address": this.issueAdminForm.get('address').value,
            "lat": this.issue['loc'].coordinates[1],
            "lng": this.issue['loc'].coordinates[0],
            "reset_assigned_to": true
        }

        if (this.issueAdminForm.get('status').value == 'RESOLVED') updatedIssue['resolution'] = this.issueAdminForm.get('resolution').value
        if (this.issueAdminForm.get('resolution').value == 'DUPLICATE') updatedIssue['dupe_of'] = this.issueAdminForm.get('duplicate').value

        let comment = this.issueAdminForm.get('comments').value
        if ( this.issue['bug_address'] != updatedIssue.cf_city_address) {
            if (comment != '') {
                comment += " -- " + this.translationService.get_instant("DASHBOARD.ADMIN_ADDRESS_CHANGED", {old_addr:this.issue['bug_address'], new_addr:updatedIssue.cf_city_address})
            } else {
                comment = this.translationService.get_instant("DASHBOARD.ADMIN_ADDRESS_CHANGED", {old_addr:this.issue['bug_address'], new_addr:updatedIssue.cf_city_address})
            }
        }

        this.requestGuard = true;
        this.issuesService.update_bug(updatedIssue, comment, this.uploadFilesFormData)

        this.enableAdmin = false;

        // this.fetchIssue()
        // this.fetchComments()

    }

    resetAdmin() {
        this.setAdminInitialForm()
        this.mapLayers[0].setLatLng([this.issue.loc.coordinates[1],this.issue.loc.coordinates[0]]);
        this.issueZoom = 17;
        this.issueCenter = L.latLng([this.issue.loc.coordinates[1],this.issue.loc.coordinates[0]])
        this.enableAdmin = false;
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
                            if (this.enableAdmin) {
                                this.mapLayers[0].setLatLng(this.issueCenter)
                                this.issueAdminForm.patchValue({address:data.results[0].formatted_address})
                            }
                        } else {
                            this.toastr.error(this.translationService.get_instant('ADDRESS_NOT_FOUND_MSG'), this.translationService.get_instant('ERROR'), {timeOut:6000, progressBar:true, enableHtml:true})
                        }
                    },
                    error => this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                )
        }
    }
    //
    //  --- ISSUE ADMIN FUNCTIONS
    //


    //
    //  ISSUE DISPLAY FUNCTIONS
    //

    imageLoadError() {
        this.imageBroken = true;
    }

    IBMwatson = false;
    IBMwatsonSuggestions = []
    IBMwatsonSuggDep = ''
    imageLoaded() {
        this.imageBroken == false
            this.IBMwatson = true
            this.issuesService.get_IBMwatson_recommendations(this.fetch_params.bug_id)
            .subscribe(
                data => {
                    this.IBMwatsonSuggestions = data
                    this.IBMwatsonSuggestions.forEach( (sugg) => {
                        if (sugg.class == "streetlight" || sugg.class == "lamp") {
                            this.IBMwatsonSuggDep = "light"
                        }
                        if (sugg.class == "vehicle"){
                            this.IBMwatsonSuggDep = "road"
                        }
                        if (sugg.class == "tree" || sugg.class == "plant"){
                            this.IBMwatsonSuggDep = "green"
                        }
                    })
                }
            )

    }

    openLightbox() {
        this.lightbox.open(this.issueImage)
    }


    fetchIssue() {
        this.issuesService.fetch_issues(this.fetch_params)
        .subscribe(
            data => {
                this.requestGuard = false;

                this.issue = data[0];
                this.displayIssuesOnMap(data[0]);

                this.issueImage[0].caption = `${this.issue['bug_id']} (${this.issue['value_desc']})`
                if (this.imageBroken) {
                    this.issueIcon = "fa "+this.issuesService.get_issue_icon(this.issue['issue'])
                }

                this.setAdminInitialForm()
            },
            error => { this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})},
            () => {
                if (this.issuesService.departments.includes(this.issue.bug_component) || this.issuesService.departments.includes(this.depServ.control_department) ) {
                    this.adminGuard = false
                }
            }
        )
    }

    history = []
    cc_list = []
    fetchComments() {
        this.history = []
        this.cc_list = []
        this.issuesService.fetch_issue_comment(this.fetch_params.bug_id)
        .subscribe(
            data => {
                let id = this.fetch_params.bug_id;
                let com_text:string

                let duplicate_issue_status = '';
                data.bugs[id].comments.slice(1).forEach((comment, comment_index) => {

                    com_text = comment.text
                    let com_text_splitted = com_text.split(" ");
                    switch (true) {
                        case (com_text_splitted[0] == "undefined"):
                            com_text = "undefined";
                            break
                        case (com_text_splitted.indexOf("This") != -1):
                            com_text = com_text_splitted[com_text_splitted.length-2];
                            duplicate_issue_status = 'RESOLVED';
                            break
                        case (com_text_splitted.indexOf("Bug") != -1):
                            com_text = this.translationService.get_instant("DASHBOARD.DUPLICATE_ISSUE_REPORTED") + " #" + com_text_splitted[2]
                            duplicate_issue_status = 'CONFIRMED';
                    }


                    var status_index = -1;
                    var dep_index = -1;
                    var filename:string;
                    var fileURLs = [];
                    var file_types = [];
                    var name:string;
                    var user_status:string;
                    for (let l = 0; l < comment.tags.length; l++) {

                        if (comment.tags[l].split(":")[0].toUpperCase() == "STATUS") {status_index = l}

                        if (comment.tags[l].split(":")[0].toUpperCase() == "DEPARTMENT") {dep_index = l}

                        if (comment.tags[l].split(":")[0].toUpperCase() == "FILENAME") {
                            filename = comment.tags[l].split(":")[1]
                            fileURLs.push(this.issuesService.API + "/get_comments_files?bug_id=" + id + "&filename=" + filename);

                            (filename.split(".")[1] =='jpeg' || filename.split(".")[1] == "png") ? file_types.push("image") : file_types.push("application")
                        }

                        if (comment.tags[l].split(":")[0].toUpperCase() == "NAME") { name = comment.tags[l].split(":")[1]}

                        if (comment.tags[l].split(":")[0].toUpperCase() == "ACTION" && comment.tags[l].split(":")[1].toUpperCase() == "NEW-USER") {
                            user_status = "NEW-USER";
                            for (let j = 0; j < comment.tags.length; j++){
                                if (comment.tags[j].split(":")[0].toUpperCase() == "NAME") {
                                    var cc_name = comment.tags[j].split(":")[1];
                                }
                                if (comment.tags[j].split(":")[0].toUpperCase() == "MOBILE") {
                                    var cc_mobile = comment.tags[j].split(":")[1];
                                }
                                if (comment.tags[j].split(":")[0].toUpperCase() == "EMAIL") {
                                    var cc_email = comment.tags[j].split(":")[1];
                                }
                            }
                        }

                        if (comment.tags[l].split(":")[0].toUpperCase() == "ACTION" && comment.tags[l].split(":")[1].toUpperCase() == "USER-EXISTED") {
                            user_status = "USER-EXISTED";
                        }

                    }

                    var history_object = {
                        "fileURLs": fileURLs,
                        "file_types": file_types,
                        "text": com_text,
                        "timestamp": comment.time
                    }

                    if (status_index != -1) {
                        history_object['state'] = comment.tags[status_index].split(":")[1]
                        history_object['department'] = comment.tags[dep_index].split(":")[1]

                        // history.push({"fileURLs": fileURLs, "file_types": file_types,"text": com_text, "timestamp": comment.time, "state": comment.tags[status_index].split(":")[1], "department": comment.tags[dep_index].split(":")[1] });
                    } else {

                        history_object['state'] = 'USER_COMMENTED';

                        if (duplicate_issue_status)  history_object['state'] = duplicate_issue_status

                        history_object['department'] = this.history[comment_index-1].department
                        history_object['name'] = name

                        if (user_status == 'USER-EXISTED' ) {
                            if (fileURLs.length == 0){
                                history_object['state'] = 'USER_COMMENTED'
                            }else{
                                history_object['state'] = 'USER_UPLOADED_FILES'
                            }
                        }

                        if (user_status == 'NEW-USER' ) {
                            history_object['state'] = 'NEW_USER_SUBSCRIBED'
                            this.cc_list.push({"fileURLs": fileURLs, "file_types": file_types,"name": cc_name, "mobile": cc_mobile, "mail": cc_email});
                        }
                    }

                    this.history.push(history_object)
                })
            },
            error => { this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})},
            () => {}
        )
    }

    displayIssuesOnMap(issue) {

        this.issue['created_ago'] = moment(new Date(issue.create_at)).locale(this.translationService.getLanguage()).fromNow();

        let icon = this.issuesService.get_issue_icon(issue.issue)
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

    leafletMap: L.Map
    onMapReady(map: L.Map){
        this.leafletMap = map
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
            	// 		overlayTitle : this.markerClusterGroup,
            	// 		// StaticLightingMarkers: StaticLightingMarkers
            	// 	}
            	// };
            },
            error => {},
            () => { }
        )

        map.on('click', (ev:L.LeafletMouseEvent) => {
            if (this.enableAdmin) {
                this.mapLayers[0].setLatLng(ev.latlng);
                this.issuesService.get_issue_address(ev.latlng.lat, ev.latlng.lng)
                    .subscribe(
                        data =>
                        {
                            if (data.results.length > 1) {
                                this.issueAdminForm.patchValue({address:data.results[0].formatted_address})
                            }
                        },
                        error => this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                    )
            }
            // map.invalidateSize()

        })

    }

    markerClusterReady(group: L.MarkerClusterGroup) {
        this.markerClusterGroup = group;
    }

    panorama: any
    initGoogleStreetView() {
        let issueType = this.issue.issue;

        var sv = new google.maps.StreetViewService();
        this.panorama = new google.maps.StreetViewPanorama(this.gmapElement.nativeElement);

        sv.getPanoramaByLocation({lat: this.issue.loc.coordinates[1], lng: this.issue.loc.coordinates[0]}, 200, checkNearestStreetView);


        // sv.getPanorama({location: berkeley, radius: 50}, processSVData);
        let panorama = this.panorama
        let issueLoc = [this.issue.loc.coordinates[1], this.issue.loc.coordinates[0]]
        function checkNearestStreetView(panoData, status) {
            if (panoData != null) {
                var issueMarker = new google.maps.Marker({
                    position: panoData.location.latLng,
                    map: panorama,
                    icon: `../assets/issue_icons/red2x.png`,
                    visible: true
                });
                if (panorama != undefined)
                    panorama.setPosition(panoData.location.latLng);
                google.maps.event.trigger(panorama, "resize");
            }
        }
    }

    onMapSelection(map) {
        this.activeMap = map

        if (map == "google" && this.panorama == undefined) {
            this.initGoogleStreetView()
        }

        if (map == "leaflet") {
            setTimeout(() => {
                this.leafletMap.invalidateSize()
            }, 50)
        }

    }

    //
    //  --- ISSUE DISPLAY FUNCTIONS
    //


    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

}
