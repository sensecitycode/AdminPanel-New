import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tileLayer, latLng, marker, icon, LeafletMouseEvent } from 'leaflet';
import { FormControl, Validators, AbstractControl, FormGroup } from '@angular/forms';
import { LowerCasePipe } from '@angular/common';
import { Map } from 'leaflet';
import { MatCheckbox } from '@angular/material';

@Component({
  selector: 'app-map-link',
  templateUrl: './map-link.component.html',
  styleUrls: ['./map-link.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class MapLinkComponent implements OnInit{

  constructor(private http: HttpClient) { }

  mapInit:object;
  ngOnInit() {
     this.mapInit = {
        layers: [
          tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>' })
        ],
        zoom: 6,
        center: latLng(38.074208 , 22.824312)
     };
  }

  city:string;
  sugg_domain:string;
  marker;
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
                this.sugg_domain = data.results['0'].address_components['0'].short_name;
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
               console.log('error occured');
            },
            () => {
               clearTimeout(req1_canc);
            }
        );

        let req1_canc = setTimeout(() => {
           request1.unsubscribe();
           alert("Google service not working!");
        }, 10000);
     }
  };

  clickcount=0;
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
         const request2 = this.http.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${ev.latlng.lat},${ev.latlng.lng}&sensor=false&language=EL&key=AIzaSyCHBdH6Zw1z3H6NOmAaTIG2TwIPTXUhnvM`,
         {
          responseType:'json'
         })
          .subscribe(
            data => {
               // console.log(data.results);
               for (let res_index in data.results){
                  // console.log(data.results[res_index]);
                  for (let addr_ind in data.results[res_index].address_components ){
                     // console.log(data.results[res_index].address_components[addr_ind]);
                     if (data.results[res_index].address_components[addr_ind].types.indexOf("administrative_area_level_4")!=-1){
                        this.city = data.results[res_index].address_components[addr_ind].short_name;
                        this.onCitySelect();
                        break;
                     }
                  }
                  break;
               }
            },
            error => {
               console.log(error);
            },
            () => {
               clearTimeout(req2_canc);
            }
         );
         let req2_canc = setTimeout(() => {
            request2.unsubscribe();
            alert("Google service not working!");
         }, 10000);
         this.clickcount++;
         // console.log(this.clickcount);
     });
  }


  domain:string;
  last_domain:string;
  onDomainSelect(){
     this.sugg_domain = this.sugg_domain.replace(/ /g,"");
     if (this.sugg_domain!=this.last_domain){
        this.domain = (this.sugg_domain+".sense.city").toLowerCase()
     }
     this.last_domain = this.sugg_domain;
  }


  mapForm = new FormGroup({
     city: new FormControl('', Validators.required),
     domain:  new FormControl('', Validators.required)
     // checkbox:  new FormControl(false , this.checkedValidator)
  });

  // checkedValidator(AC: AbstractControl) {
  //    let checkbox = AC.root.get('checkbox');
  //    if (!checkbox) return null;
  //    return checkbox.value === true ? null : {checkedValidator: true}
  // }

}
