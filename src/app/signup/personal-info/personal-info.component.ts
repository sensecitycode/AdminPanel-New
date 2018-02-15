import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {FormControl, Validators, FormGroup } from '@angular/forms';

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class PersonalInfoComponent implements OnInit {

  constructor() { }
  ngOnInit() {
  }

  personalInfoForm = new FormGroup ({
     // role: new FormControl('', Validators.required),
     firstname: new FormControl('', Validators.required),
     lastname: new FormControl('', Validators.required),
     telephone: new FormControl('', Validators.required),
     email: new FormControl('', [Validators.required,Validators.pattern(EMAIL_REGEX)]),
     addressForm: new FormGroup ({
        road: new FormControl(''),
        city: new FormControl(''),
        province: new FormControl(''),
        postal: new FormControl('')
     })
  });

}
