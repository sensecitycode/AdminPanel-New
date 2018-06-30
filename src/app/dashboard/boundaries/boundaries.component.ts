import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tileLayer, latLng, marker, icon, LeafletMouseEvent, geoJSON, GeoJSON, point } from 'leaflet';
import { Map } from 'leaflet';
import { TranslationService } from '../../shared/translation.service';
import { MunicipalityService } from '../municipality.service'
import { ToastrService } from 'ngx-toastr';


@Component({
    selector: 'app-boundaries',
    templateUrl: './boundaries.component.html',
    styleUrls: ['./boundaries.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class BoundariesComponent implements OnInit {

    constructor(private http: HttpClient, private translationService:TranslationService, private toastr: ToastrService, private municService: MunicipalityService) { }

    polygonStr = `
    <pre>{\n"type": "Polygon",\n"coordinates": [
    [
     [<strong>[Long0, Lat0]</strong>, ... , <strong>[Long0, Lat0]</strong>]
    ]\n]}</pre>`

    multiPolygonStr = `
    <pre>{\n"type": "MultiPolygon",\n"coordinates": [
    [
     [<strong>[Long0, Lat0]</strong>, ... , <strong>[Long0, Lat0]</strong>]
    ],
    [
     [<strong>[Long1, Lat1]</strong>, ... , <strong>[Long1, Lat1]</strong>],
     [<strong>[Long2, Lat2]</strong>, ... , <strong>[Long2, Lat2]</strong>]
    ]\n]}</pre>`

    city:string = sessionStorage.getItem('city');
    mapInit:object;
    boundaryLayer = [];
    geoJSON:GeoJSON;

    geojsonFeature:any = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "id": "Multipolygon",
            "properties": {"name": "Multipolygon"},
            "geometry": {"type": "", "coordinates": ""}
        }]
    }

    ngOnInit() {
        this.mapInit = {
            layers: [
                tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>' })
            ],
            zoom: 6,
            center: latLng(38.074208 , 22.824312)
        };
        this.municService.get_boundaries()
            .subscribe(
                data => {
                    console.log(data)
                    if (data.length == 0) {
                        this.toastr.error(this.translationService.get_instant('DASHBOARD.CITY_BOUNDARIES_ERROR'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                    } else {
                        this.geojsonFeature.features[0].geometry = {"type": data[0].boundaries.type, "coordinates": data[0].boundaries.coordinates};

                        this.geoJSON = geoJSON(this.geojsonFeature);

                        this.boundaryLayer = [
                            this.geoJSON
                        ];
                    }
                },
                error => {
                    this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                },
                () => {}
            );

    }

    onMapReady(map: Map){
        map.on ('layeradd', (ev:LeafletMouseEvent) => {
            map.fitBounds(this.geoJSON.getBounds(), {
                padding: point(24, 24),
                maxZoom: 12,
                animate: true
            });
        });
    }

    submitBoundaries() {
        console.log(this.boundariesObj)
        this.municService.update_municipality(this.boundariesObj)
        .subscribe(
            data => console.log(data),
            error => console.error(error)
        )
    }

    displayCityOnMap(boundaries) {
        console.log('displayCityOnMap')
        this.boundaryLayer = []

        // this.validateJSON(boundaries)
        this.boundariesObj = boundaries

        console.log(this.boundariesObj)


        this.geojsonFeature.features[0].geometry = {"type": boundaries.type, "coordinates": boundaries.coordinates}

        this.geoJSON = geoJSON(this.geojsonFeature);
        console.log(this.geoJSON)

        this.boundaryLayer = [
            this.geoJSON
        ];

        this.submitButtonEnabled = true;

    }

    validateJSON(boundaries) {
        console.log(boundaries)
        let valid:boolean = false;
        let poly = boundaries.coordinates[0]
        if (boundaries.type == 'Polygon') {
            console.log(poly)
            console.log(poly[0])
            console.log(poly[poly.length - 1])
            valid = arraysEqual(poly[0], poly[poly.length - 1])
        }

        else if (boundaries.type == 'MultiPolygon') {
            console.log(poly)
            for (let polygon of poly) {
                console.log(polygon)
                console.log(polygon[0])
                console.log(polygon[polygon.length - 1])

                valid = arraysEqual(polygon[0], polygon[polygon.length - 1])
                if (valid == false) break;

            }
        }

        function arraysEqual(arr1, arr2) {
            if(arr1.length !== arr2.length)
            return false;
            for(var i = arr1.length; i--;) {
                if(arr1[i] !== arr2[i])
                return false;
            }

            return true;
        }

        console.log(valid)
        return valid

    }

    fileName = ""
    submitButtonEnabled = false;
    boundariesObj = {}
    fileUploadHandler(files: FileList) {
        this.boundariesObj = {}
        this.submitButtonEnabled = false;
        this.fileName = ""

        if (files[0]) {
            if (files[0].type == "application/json") {
                this.fileName = files[0].name
                let reader = new FileReader()
                let text:string
                let json = {}
                reader.onload = () => {
                    text = reader.result
                    console.log(text)
                    try {
                        json = JSON.parse(text)
                        console.log(json)
                        if (this.validateJSON(json)) {
                            this.displayCityOnMap(json)
                        } else {
                            this.toastr.error(this.translationService.get_instant('DASHBOARD.INVALID_BOUNDARIES_FILE_ERROR'), this.translationService.get_instant('ERROR'), {timeOut:4000, progressBar:true, enableHtml:true})
                        }

                    } catch (ex) {
                        console.error(ex)
                        this.toastr.error(this.translationService.get_instant('DASHBOARD.INVALID_BOUNDARIES_FILE_ERROR'), this.translationService.get_instant('ERROR'), {timeOut:4000, progressBar:true, enableHtml:true})
                    }
                }
                reader.readAsText(files[0])

            } else {
                this.toastr.error(this.translationService.get_instant('DASHBOARD.INVALID_BOUNDARIES_FILE_ERROR'), this.translationService.get_instant('ERROR'), {timeOut:4000, progressBar:true, enableHtml:true})
            }
        }
    }

    }
