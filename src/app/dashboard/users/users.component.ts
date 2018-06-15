import { Component, OnInit, ViewEncapsulation, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// import { Router, ActivatedRoute } from '@angular/router';
import { UsersService } from './users.service';
import { GridOptions } from 'ag-grid';
import { EditRendererComponent } from "./edit-renderer.component";
import { TranslationService } from '../../shared/translation.service';
// import { MatDialog, MatDialogRef } from '@angular/material';
// import { DialogsComponent } from '../dialogs/dialogs.component';




@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css'],
    encapsulation: ViewEncapsulation.Emulated,
})
export class UsersComponent implements OnInit {
    // users:any[];
    // localeText:any;
    // private gridOptions: GridOptions;
    // private gridApi;
    // private gridColumnApi;
    // private frameworkComponents;
    // private context;

    constructor(private usersServ: UsersService, private renderer:Renderer2, private translationService: TranslationService/*private dialog : MatDialogRef*/ ) { }

    @ViewChild ('addButton') addButton:ElementRef;


    ngOnInit() {
    }


}
