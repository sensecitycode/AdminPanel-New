import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tileLayer, latLng, marker, icon, LeafletMouseEvent, Polygon, polygon, geoJSON, GeoJSON, point } from 'leaflet';
import { Map } from 'leaflet';


@Component({
    selector: 'app-boundaries',
    templateUrl: './boundaries.component.html',
    styleUrls: ['./boundaries.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class BoundariesComponent implements OnInit {

    constructor(private http: HttpClient) { }

    city:string = sessionStorage.getItem('city');
    mapInit:object;
    boundaryLayer = [];
    geoJSON:GeoJSON;

    ngOnInit() {
        this.mapInit = {
            layers: [
                tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>' })
            ],
            zoom: 6,
            center: latLng(38.074208 , 22.824312)
        };
        // console.log(this.mapInit);
        const getBoundaries = this.http.get<any>(`https://apitest.sense.city:4443/api/1.0/city_coordinates?city=${this.city}`,
            {
                responseType:'json'
            })
            .subscribe(
                data => {
                    var geojsonFeature = {
                        "type": "FeatureCollection",
                        "features": [{
                            "type": "Feature",
                            "id": "Multipolygon",
                            "properties": {"name": "Multipolygon"},
                            "geometry": {"type": data[0].boundaries.type, "coordinates": data[0].boundaries.coordinates}
                        }]
                    };
                    this.geoJSON = geoJSON(geojsonFeature);

                    this.boundaryLayer = [
                        this.geoJSON
                    ];
                },
                error => {
                    console.log('error occured');
                },
                () => {
                    clearTimeout(getBoundaries_canc);
                }
            );

            let getBoundaries_canc = setTimeout(() => {
                getBoundaries.unsubscribe();
                alert("Error fetching city boundaries!");
            }, 10000);
        }

    onMapReady(map: Map){
        // console.log("ready");
        map.on ('layeradd', (ev:LeafletMouseEvent) => {
            map.fitBounds(this.geoJSON.getBounds(), {
                padding: point(24, 24),
                maxZoom: 12,
                animate: true
            });
        });
    }

}
