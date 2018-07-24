import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

import { TranslationService } from './translation.service';

@Pipe({
  name: 'localizedDate'
})
export class LocalizedDatePipe implements PipeTransform {

  constructor(private translationService: TranslationService) {
  }

  transform(value: any, pattern: string): any {
    const datePipe: DatePipe = new DatePipe(this.translationService.getLanguage());
    return datePipe.transform(value, pattern);
  }

}
