import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { MapLinkComponent } from './map-link/map-link.component';
import { AccountCreateComponent} from './account-create/account-create.component';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SignupComponent implements OnInit {

   @ViewChild(PersonalInfoComponent) persInfo;
   @ViewChild(MapLinkComponent) mapLink;
   @ViewChild(AccountCreateComponent) accCreate;

   personalInfoForm:FormGroup;
   mapForm:FormGroup;
   accountForm:FormGroup;
   submitForm:FormGroup;

   constructor() {
      this.personalInfoForm = new FormGroup({});
      this.mapForm = new FormGroup({});
      this.accountForm = new FormGroup({});
      this.submitForm = new FormGroup({
          // city_acknowledge: new FormControl(''),
          terms_acknowledge: new FormControl('')
       });
   }

   ngOnInit() {
   }

   ngAfterViewInit() {
      this.personalInfoForm = this.persInfo.personalInfoForm;
      this.mapForm = this.mapLink.mapForm;
      this.accountForm = this.accCreate.accountForm;
   }

   onSubmit(){
      console.log(this.personalInfoForm.value);
      console.log(this.mapForm.value);
      console.log(this.accountForm.value);
      console.log(this.submitForm.value);
   };
}
