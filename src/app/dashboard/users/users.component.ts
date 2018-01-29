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

    // ngOnInit() {
    //     this.usersServ.usersChanged.subscribe(
    //         (status:string) => {
    //             if (status == "userArrayPopulated"){
    //                 console.log("status == userArrayPopulated");
    //                 this.users = this.usersServ.return_userArray();
    //                 this.gridOptions.rowData = [];
    //                 for (let user of this.users) {
    //                     let departments = [];
    //                     if (user.departments[0]){
    //                         for (let deps of user.departments) {
    //                             departments.push(deps.department);
    //                         }
    //                     }
    //                     this.gridOptions.rowData.push({username: user.username, email: user.email, departments: departments})
    //                 }
    //                 this.gridApi.setRowData(this.gridOptions.rowData);
    //             }
    //         });
    //
    //
    //         this.users = this.usersServ.return_userArray() // used only for refresh
    //         this.gridOptions = <GridOptions> {};
    //         this.gridOptions =
    //         {
    //             enableSorting:true
    //         }
    //         this.gridOptions.columnDefs = [
    //             {
    //                 headerName: "",
    //                 field: "edit",
    //                 minWidth: 78,
    //                 width: 78,
    //                 suppressResize:true,
    //                 suppressFilter:true,
    //                 suppressSorting:true,
    //                 suppressSizeToFit:true,
    //                 cellRenderer: "EditRendererComponent",
    //                 pinned: 'left'
    //             },
    //             {
    //                 headerName: "Ψευδώνυμο",
    //                 field: "username",
    //                 filter: "text",
    //             },
    //             {
    //                 headerName: "Όνομα",
    //                 field: "name",
    //                 filter: "text",
    //             },
    //             {
    //                 headerName: "Επώνυμο",
    //                 field: "surname",
    //                 filter: "text",
    //             },
    //
    //             {
    //                 headerName: "Email",
    //                 field: "email",
    //                 filter: "text"
    //             },
    //             {
    //                 headerName: "Τμήματα",
    //                 field: "departments"
    //             }
    //         ];
    //
    //         this.gridOptions.rowData = [];
    //         for (let user of this.users) {
    //             let departments = [];
    //             if (user.departments){
    //                 if (user.departments[0]){
    //                     for (let deps of user.departments) {
    //                         departments.push(deps.department);
    //                     }
    //                 }
    //             }
    //             this.gridOptions.rowData.push({username: user.username, email: user.email, departments: departments})
    //         }
    //
    //         //for 1st col button
    //         this.context = { componentParent: this };
    //         this.frameworkComponents = {
    //           EditRendererComponent: EditRendererComponent
    //         };
    //
    //
    //
    //         this.translationService.languageChanged.subscribe(
    //             lang =>
    //                 {
    //                     var usernameColDef = this.gridColumnApi.getColumn("username").getColDef();
    //                     var departmentsColDef = this.gridColumnApi.getColumn("departments").getColDef();
    //                     var nameColDef = this.gridColumnApi.getColumn("name").getColDef();
    //                     var surnameColDef = this.gridColumnApi.getColumn("surname").getColDef();
    //
    //                     this.translationService.get('GRID')
    //                     .subscribe(translatedStr =>
    //                         {
    //                             usernameColDef.headerName = translatedStr.USERNAME;
    //                             departmentsColDef.headerName = translatedStr.DEPARTMENTS;
    //                             nameColDef.headerName = translatedStr.NAME;
    //                             surnameColDef.headerName = translatedStr.SURNAME;
    //                             this.gridApi.refreshHeader();
    //                             // this.localeText = {
    //                             //
    //                             //         // for filter panel
    //                             //         page: 'daPage',
    //                             // }
    //                         }
    //                     )
    //                 }
    //         );
    //     }
    //
    //
    //     onGridReady(params) {
    //         // console.log(params);
    //         this.gridApi = params.api;
    //         this.gridColumnApi = params.columnApi;
    //         // params.api.sizeColumnsToFit();
    //         // setTimeout(()=>{params.columnApi.autoSizeColumns(["edit", "username", "email","departments"]);             params.api.sizeColumnsToFit();
    //         // },4000);
    //         params.api.sizeColumnsToFit();
    //         this.translationService.get('GRID')
    //         .subscribe(translatedStr =>
    //             {
    //                 this.gridColumnApi.getColumn("username").getColDef().headerName = translatedStr.USERNAME;
    //                 this.gridColumnApi.getColumn("departments").getColDef().headerName = translatedStr.DEPARTMENTS;
    //                 this.gridColumnApi.getColumn("name").getColDef().headerName = translatedStr.NAME;
    //                 this.gridColumnApi.getColumn("surname").getColDef().headerName = translatedStr.SURNAME;
    //
    //                 this.gridApi.refreshHeader();
    //                 // this.localeText = {
    //                 //
    //                 //         // for filter panel
    //                 //         page: 'daPage',
    //                 // }
    //             }
    //         )
    //
    //     }
    //
    //
    //     onGridSizeChanged(params) {
    //         // console.log(params);
    //         // this.autoSizeAll();
    //         if (this.gridApi){
    //             var allColumnIds = [];
    //             this.gridColumnApi.getAllColumns().forEach(function(column) {
    //               allColumnIds.push(column.colId);
    //             });
    //
    //             if (params.clientWidth > 1000){
    //                 params.api.sizeColumnsToFit();
    //             } else {
    //                 this.gridColumnApi.autoSizeColumns(allColumnIds);
    //             }
    //
    //             // for responsiveness
    //             this.gridApi.refreshInMemoryRowModel("filter");
    //         }
    //     }
    //
    //     onFilterTextBoxChanged() {
    //         this.gridApi.setQuickFilter(this.renderer.selectRootElement('#filter-text-box').value);
    //         // console.log(this.gridApi.forEachNodeAfterFilter());
    //         // console.log(this.gridApi.getModel());
    //     }
    //
    //     onEdit(cell) {
    //     //     let data = {
    //     //         rowData: this.gridApi.getModel().rowsToDisplay[cell].data,
    //     //         action: "userEdit",
    //     //     }
    //     //     let dialogRef: MatDialogRef<DialogsComponent> = this.dialog.open(DialogsComponent, {data: data, disableClose: true, hasBackdrop:true});
    //     //
    //     //     dialogRef.afterClosed().subscribe(returnedData => {
    //     //         console.log("edit user dialog closed");
    //     //         console.log(returnedData);
    //     //         if (returnedData){
    //     //             this.gridApi.getDisplayedRowAtIndex(cell).setData(returnedData);
    //     //             // this.gridApi.refreshInMemoryRowModel("sort");
    //     //             this.gridApi.refreshInMemoryRowModel("filter");
    //     //         }
    //     //     })
    //     //
    //     }
    //
    //     onAddUser() {
    //         // let data = {
    //         //     action: "userAdd"
    //         // }
    //         // let dialogRef: MatDialogRef<DialogsComponent> = this.dialog.open(DialogsComponent, {data: data, width: "457px", disableClose: true, hasBackdrop:true});
    //         //
    //         // dialogRef.afterClosed().subscribe(returnedData => {
    //         //     console.log("add user dialog closed");
    //         //     console.log(returnedData);
    //         //     if (returnedData){
    //         //         var newUser = {
    //         //             username: returnedData.username,
    //         //             email: returnedData.email
    //         //         }
    //         //         var res = this.gridApi.updateRowData({ add: [newUser]});
    //         //     }
    //         // })
    //     }

}
