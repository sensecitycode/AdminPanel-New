import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class TranslationService {

    languageChanged = new Subject();
    constructor(private translate: TranslateService) {
        translate.setDefaultLang('el');
        this.translate.use('el');
    }

    switchLanguage(language: string) {
        this.translate.use(language);
        this.languageChanged.next("language changed to: " + language);
    }

    getLanguage() {
        return this.translate.currentLang;
    }
    get(keyword: string):Observable<any> {
        return this.translate.get(keyword);
    }
}
