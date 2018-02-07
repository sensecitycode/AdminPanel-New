import { Component, OnInit, OnDestroy,ViewEncapsulation, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute } from '@angular/router';

import { GridOptions, GridApi, ColumnApi } from 'ag-grid';
import { EditRendererComponent } from "../edit-renderer.component";
import { TranslationService } from '../../../shared/translation.service';
import { UsersService } from '../users.service';

// import { MatDialog, MatDialogRef } from '@angular/material';
// import { DialogsComponent } from '../dialogs/dialogs.component';


@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ListUsersComponent implements OnInit {
    users:any[];
    localeText:any;
    private gridOptions: GridOptions;
    private gridApi: GridApi;
    private gridColumnApi: ColumnApi;
    private frameworkComponents;
    private context;
    private rowData: any[];
    private columnDefs: any[];

    private subscriptions = new Subscription();

    constructor(private usersServ: UsersService,
                private renderer:Renderer2,
                private translationService: TranslationService,
                private router: Router,
                private activatedRoute: ActivatedRoute/*private dialog : MatDialogRef*/ )
        {
        }

    @ViewChild ('addButton') addButton:ElementRef;

    ngOnInit() {
        this.gridOptions = <GridOptions>{};
        const rowData = [];



        this.subscriptions.add(this.usersServ.usersChanged.subscribe(
            (status:string) => {
                if (status == "userArrayPopulated"){
                    console.log("status == userArrayPopulated");
                    this.users = this.usersServ.return_userArray();
                    this.subscriptions.add(this.translationService.get('ROLES')
                        .subscribe(translatedStr =>
                            {
                                for (let user of this.users) {
                                    let departments = [];
                                    if (user.departments){
                                        if (user.departments[0]){
                                            for (let deps of user.departments) {
                                                // departments.push(deps.department);
                                                departments.push(deps);
                                            }
                                        }
                                    }
                                    let roles = [];
                                    if (user.role_name){
                                        for (let role of user.role_name) {
                                            roles.push(translatedStr[role]);
                                        }
                                    }
                                    rowData.push({username: user.username, position:user.position, roles: roles, departments: departments})
                                }
                            }
                        )
                    )
                }
                this.rowData = rowData;
            }
        ));


        this.subscriptions.add(this.translationService.get('GRID')
            .subscribe(translatedStr =>
                {
                    const columnDefs = [
                        {
                            headerName: "",
                            field: "edit",
                            minWidth: 72,
                            width: 72,
                            suppressResize:true,
                            suppressFilter:true,
                            suppressSorting:true,
                            suppressSizeToFit:true,
                            cellRenderer: "EditRendererComponent",
                            pinned: 'left'
                        },
                        {
                            headerName: translatedStr.USERNAME,
                            field: "username",
                            filter: "text",
                        },
                        {
                            headerName: translatedStr.POSITION,
                            field: "position",
                            filter: "text",
                        },

                        {
                            headerName: translatedStr.USEROLE,
                            field: "roles",
                            filter: "text"
                        },
                        {
                            headerName: translatedStr.DEPARTMENTS,
                            field: "departments",
                            filter: "text"
                        }
                    ];
                    this.columnDefs = columnDefs;
                }
        ))
        // console.log(this.subscriptions)


        // this.rowData = this.createRowData();
        // this.columnDefs = this.createColumnDefs();
        this.context = { componentParent: this };
        this.frameworkComponents = {
          EditRendererComponent: EditRendererComponent
        };



        this.translationService.languageChanged.subscribe(
            lang =>
                {
                    let usernameColDef = this.gridColumnApi.getColumn("username").getColDef();
                    let departmentsColDef = this.gridColumnApi.getColumn("departments").getColDef();
                    let positionColDef = this.gridColumnApi.getColumn("position").getColDef();
                    let rolesColDef = this.gridColumnApi.getColumn("roles").getColDef();

                    this.translationService.get('GRID')
                    .subscribe(translatedStr =>
                        {
                            usernameColDef.headerName = translatedStr.USERNAME;
                            departmentsColDef.headerName = translatedStr.DEPARTMENTS;
                            positionColDef.headerName = translatedStr.POSITION;
                            rolesColDef.headerName = translatedStr.USEROLE;
                            this.gridApi.refreshHeader();
                            // this.localeText = {
                            //
                            //         // for filter panel
                            //         page: 'daPage',
                            // }
                        }
                    )
                }
        );

        this.usersServ.populate_userArray();
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    onGridSizeChanged(params) {
        // console.log(params);
        let gridApi = params.api;
        let gridColumnApi = params.columnApi;

        if (gridColumnApi){
            let allColumnIds = [];
            gridColumnApi.getAllColumns().forEach(function(column) {
                allColumnIds.push(column.getColId());
            });

            if (params.clientWidth > 1000){
                gridColumnApi.autoSizeColumns(allColumnIds);
                gridApi.sizeColumnsToFit();
            } else {
                gridColumnApi.autoSizeColumns(allColumnIds);
            }

            // for responsiveness
            gridApi.refreshInMemoryRowModel("filter");

        }
    }




    onFilterTextBoxChanged() {
        this.gridApi.setQuickFilter(this.renderer.selectRootElement('#filter-text-box').value);
    }

    onDisplayUserDetails(cell) {
        let data = {
            // rowData: this.gridApi.getModel().rowsToDisplay[cell].data,
            rowNode: this.gridApi.getDisplayedRowAtIndex(cell),
            user: this.users[this.gridApi.getDisplayedRowAtIndex(cell).id],
            // row: cell,
            gridApi: this.gridApi,
        }
        // this.usersServ.set_userDetails(data);
        this.router.navigate([data.user.username], {relativeTo: this.activatedRoute});

        // this.gridApi.getDisplayedRowAtIndex(cell).setData(returnedData);
        // // this.gridApi.refreshInMemoryRowModel("sort");
        // this.gridApi.refreshInMemoryRowModel("filter");

    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
}
