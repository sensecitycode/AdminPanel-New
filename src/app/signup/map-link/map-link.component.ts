import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, Validators, AbstractControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LowerCasePipe } from '@angular/common';
import { MatCheckbox } from '@angular/material';
import { TranslationService } from '../../shared/translation.service';


import { Map } from 'leaflet';
import { tileLayer, latLng, marker, icon, LeafletMouseEvent, Marker } from 'leaflet';

import { AppBootStrapComponent } from '../../../app/app-bootstrap.component';
@Component({
    selector: 'app-map-link',
    templateUrl: './map-link.component.html',
    styleUrls: ['./map-link.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class MapLinkComponent implements OnInit{

    constructor(private http: HttpClient, private translationService: TranslationService, private bootstrapComp : AppBootStrapComponent, private toastr: ToastrService) { }

    mapInit:object;
    API:string;

    ngOnInit() {
        this.mapInit = {
            layers: [
                tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>' })
            ],
            zoom: 6,
            center: latLng(38.074208 , 22.824312)
        };
        this.API = this.bootstrapComp.API;
    }
    mapForm = new FormGroup({
        city: new FormControl('', Validators.required),
        domain:  new FormControl('', Validators.required)
        // checkbox:  new FormControl(false , this.checkedValidator)
    });

    city:string;
    sugg_domain:string;
    marker: Marker;
    markerLayer:Array<object>;
    markerCenter:object;
    markerZoom:number;
    invalidcity=false;

    onCitySelect(){
        // this.sugg_domain = this.city;
        this.markerLayer = [];
        if (this.city){
            const request1 = this.http.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?address=${this.city}&sensor=false&language=EN&key=AIzaSyCHBdH6Zw1z3H6NOmAaTIG2TwIPTXUhnvM`,
                {
                    responseType:'json'
                })
                .subscribe(
                    data => {
                        // console.log(data);
                        if (data.status=="OK")
                        {
                            this.invalidcity=false;
                            this.sugg_domain = data.results['0'].address_components['0'].long_name;
                            this.marker = marker([data.results['0'].geometry.location.lat, data.results['0'].geometry.location.lng], {
                                icon:icon ({
                                    iconSize: [25,41],
                                    iconAnchor: [13,41],
                                    iconUrl: 'assets/marker-icon.png',
                                    shadowUrl: 'assets/marker-shadow.png'
                                })
                            });
                            this.markerLayer.push(this.marker);
                            this.markerCenter = latLng(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng);
                            this.markerZoom = 11;
                            this.onDomainSelect();
                        } else {
                            this.invalidcity= true;
                        }
                    },
                    error => {
                        this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                    },
                    () => {
                    }
                );
            }
        };

        onMapReady(map: Map){
            map.on ('click', (ev:LeafletMouseEvent) => {
                this.markerLayer = [];
                this.marker = marker([ev.latlng.lat, ev.latlng.lng], {
                    icon:icon ({
                        iconSize: [25,41],
                        iconAnchor: [13,41],
                        iconUrl: 'assets/marker-icon.png',
                        shadowUrl: 'assets/marker-shadow.png'
                    })
                });
                this.markerLayer.push(this.marker);
                this.markerCenter = latLng(ev.latlng.lat, ev.latlng.lng);
                this.markerZoom = 11;
                let query_lang = this.translationService.getLanguage();
                const request2 = this.http.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${ev.latlng.lat},${ev.latlng.lng}&sensor=false&language=${query_lang}&key=AIzaSyCHBdH6Zw1z3H6NOmAaTIG2TwIPTXUhnvM`,
                    {
                        responseType:'json'
                    })
                    .subscribe(
                        data => {
                            // console.log(data.results);
                            this.translationService.getLanguage();
                            // for (let res_index in data.results){
                            //    // console.log(data.results[res_index]);
                            //    for (let addr_ind in data.results[res_index].address_components ){
                            //       // console.log(data.results[res_index].address_components[addr_ind]);
                            //       if (data.results[res_index].address_components[addr_ind].types.indexOf("administrative_area_level_4")!=-1){
                            //          this.city = data.results[res_index].address_components[addr_ind].short_name;
                            //          this.onCitySelect();
                            //          break;
                            //       }
                            //    }
                            //    break;
                            // }
                            if (data.results.length > 1) {
                                this.invalidcity = false;
                                for (let addr_index in data.results[1].address_components) {
                                    if (data.results[1].address_components[addr_index].types.indexOf("country")!=-1){
                                        for (let addr_index in data.results[0].address_components) {
                                            if (data.results[0].address_components[addr_index].types.indexOf("political")!=-1){
                                                this.city = data.results[0].address_components[addr_index].long_name;
                                                break;
                                            }
                                        }
                                        break;
                                    }
                                    if (data.results[1].address_components[addr_index].types.indexOf("locality")!=-1){
                                        this.city = data.results[1].address_components[addr_index].long_name;
                                        break;
                                    }
                                    if (data.results[1].address_components[addr_index].types.indexOf("political")!=-1){
                                        this.city = data.results[1].address_components[addr_index].long_name;
                                        break;
                                    }
                                }
                                // this.onCitySelect();
                                const request1 = this.http.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?address=${this.city}&sensor=false&language=EN&key=AIzaSyCHBdH6Zw1z3H6NOmAaTIG2TwIPTXUhnvM`,
                                    {
                                        responseType:'json'
                                    })
                                    .subscribe(
                                        data => {
                                            this.sugg_domain = data.results['0'].address_components['0'].long_name;
                                            this.onDomainSelect();
                                        },
                                        error => {
                                            this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                                        },
                                        () => {}
                                    )

                            } else {
                                this.invalidcity = true;
                            }
                    },
                    error => {
                        this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                    },
                    () => {
                    }
                );
            });
        }

        domain:string;
        last_domain:string;
        onDomainSelect(){
            this.mapForm.get('domain').markAsTouched();

            this.sugg_domain = this.sugg_domain.replace(/ /g,"");
            // console.log((this.sugg_domain).toLowerCase())
            if (this.sugg_domain!=this.last_domain){
                this.domain = (this.sugg_domain).toLowerCase()
            }
            this.last_domain = this.sugg_domain;
            this.checkCityExists((this.sugg_domain).toLowerCase());
        }

        cityExists:boolean = false;
        checkCityExists(city) {
            // console.log(city)
            // console.log(`${this.API}/available_city?city=${city}`)
            this.http.get<{bool_flag: boolean}>(`${this.API}/available_city?city=${city}`)
                .subscribe(
                    data => { this.cityExists = data.bool_flag },
                    error => {
                        // alert("Check city availability service is not responding!");
                        this.toastr.error(this.translationService.get_instant('SERVICES_ERROR_MSG'), this.translationService.get_instant('ERROR'), {timeOut:8000, progressBar:true, enableHtml:true})
                    },
                    () => {
                        if (this.cityExists == true ) {
                            // console.log('error set')
                            // console.log(this.mapForm.get('domain'))
                            this.mapForm.get('domain').setErrors({cityExists:true})
                        }
                        // clearTimeout(fetchUsers_canc);
                    }
                )
        }
    }
