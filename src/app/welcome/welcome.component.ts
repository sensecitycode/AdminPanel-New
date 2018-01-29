import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslationService } from '../shared/translation.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class WelcomeComponent implements OnInit {

  constructor(private translationService: TranslationService) { }

  ngOnInit() {
  }

}
