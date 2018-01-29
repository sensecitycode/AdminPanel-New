import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {FormControl, Validators, AbstractControl, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-account-create',
  templateUrl: './account-create.component.html',
  styleUrls: ['./account-create.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AccountCreateComponent implements OnInit {

  constructor() { }

  ngOnInit() {  }

  accountForm = new FormGroup({
      name: new FormControl('', Validators.required),
      passwordForm: new FormGroup({
        pw1: new FormControl('', Validators.required),
        pw2: new FormControl('', Validators.required)
      }, this.noMatchingPassword)
   });

  noMatchingPassword(AC: AbstractControl) {
     let pass = AC.get('pw1');
     let confirmPass = AC.get('pw2');
     if (!pass || !confirmPass) return null;
     return pass.value === confirmPass.value ? null : {noMatchingPassword:true};
     }

  onSubmit() {
     console.log("submitted");
     console.log(this.accountForm);
  };
  // accountFormControl = new FormControl('', Validators.required);
  // passwordFormControl = new FormControl('', Validators.required);
  // confirmPasswordFormControl = new FormControl('', Validators.required);

  }
