import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {FormControl, Validators, AbstractControl, FormGroup } from '@angular/forms';

import { TranslationService} from '../../shared/translation.service';

@Component({
    selector: 'app-account-create',
    templateUrl: './account-create.component.html',
    styleUrls: ['./account-create.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class AccountCreateComponent implements OnInit {

    constructor(private translationService: TranslationService) { }

    ngOnInit() {  }

    accountForm = new FormGroup({
        name: new FormControl('', Validators.required),
        passwordForm: new FormGroup({
            pw1: new FormControl('', Validators.required),
            pw2: new FormControl('', Validators.required)
        }, this.noMatchingPassword),
        department: new FormControl('', Validators.required)
    });

    noMatchingPassword(AC: AbstractControl) {
        let pass = AC.get('pw1');
        let confirmPass = AC.get('pw2');

        if (pass.value != confirmPass.value) {
            confirmPass.setErrors({noMatchingPassword: true});
        } else {
            confirmPass.setErrors(null);
            return null
        }
    }

    onSubmit() {
        console.log("submitted");
        console.log(this.accountForm);
    };
    // accountFormControl = new FormControl('', Validators.required);
    // passwordFormControl = new FormControl('', Validators.required);
    // confirmPasswordFormControl = new FormControl('', Validators.required);

}
