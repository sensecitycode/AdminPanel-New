import { Component, OnInit, OnDestroy,ViewEncapsulation, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute } from '@angular/router';

import { GridOptions, GridApi, ColumnApi } from 'ag-grid';
import { depEditRendererComponent } from './dep-edit-renderer.component';
import { TranslationService } from '../../../shared/translation.service';
import { DepartmentsService } from '../departments.service';

// import { MatDialog, MatDialogRef } from '@angular/material';
// import { DialogsComponent } from '../dialogs/dialogs.component';

@Component({
  selector: 'app-list-departments',
  templateUrl: './list-departments.component.html',
  styleUrls: ['./list-departments.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ListDepartmentsComponent implements OnInit {
    users:any[];
    departments:any[];
    public gridOptions: GridOptions;
    public gridApi: GridApi;
    public gridColumnApi: ColumnApi;
    public frameworkComponents;
    public context;
    public rowData: any[];
    public columnDefs: any[];

    private subscriptions = new Subscription();

    constructor(private depServ: DepartmentsService,
                private renderer:Renderer2,
                private translationService: TranslationService,
                private router: Router,
                private activatedRoute: ActivatedRoute/*private dialog : MatDialogRef*/ )
        {}


    ngOnInit() {
        this.gridOptions = <GridOptions>{};
        const rowData = [];


        this.subscriptions.add(this.depServ.departmentsChanged.subscribe(
            (status:string) => {
                if (status == "departmentsArrayPopulated"){
                    this.departments = this.depServ.return_departmentsArray();
                    for (let dep of this.departments) {
                        let dep_manager = dep.default_assigned_email[0].username;
                        let dep_manager_position = dep.default_assigned_email[0].position ? dep.default_assigned_email[0].position : '';
                        rowData.push({departments: dep.component_name, manager: dep_manager, manager_position: dep_manager_position})
                    }
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
                            cellRenderer: "depEditRendererComponent",
                            pinned: 'right'
                        },
                        {
                            headerName: translatedStr.DEPARTMENTS,
                            field: "departments",
                            filter: "text",
                        },

                        {
                            headerName: translatedStr.DEP_MANAGER,
                            field: "manager",
                            filter: "text",
                        },
                        {
                            headerName: translatedStr.DEP_MANAGER_POSITION,
                            field: "manager_position",
                            filter: "text",
                        }
                    ];
                    this.columnDefs = columnDefs;
                }
        ))


        this.context = { componentParent: this };
        this.frameworkComponents = {
          depEditRendererComponent: depEditRendererComponent
        };


        this.translationService.languageChanged.subscribe(
            lang =>
                {
                    let departmentColDef = this.gridColumnApi.getColumn("departments").getColDef();
                    let managerColDef = this.gridColumnApi.getColumn("manager").getColDef();
                    let managerPositionColDef = this.gridColumnApi.getColumn("manager_position").getColDef();


                    this.translationService.get('GRID')
                    .subscribe(translatedStr =>
                        {
                            departmentColDef.headerName = translatedStr.DEPARTMENTS;
                            managerColDef.headerName = translatedStr.DEP_MANAGER;
                            managerPositionColDef.headerName = translatedStr.DEP_MANAGER_POSITION;
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

        this.depServ.populate_departmentsArray();
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    onGridSizeChanged(params) {
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

    onDisplayDepartmentDetails(cell, mode) {
        let data = {
            rowNode: this.gridApi.getDisplayedRowAtIndex(cell),
            department: this.departments[this.gridApi.getDisplayedRowAtIndex(cell).id],
            // row: cell,
            gridApi: this.gridApi,
        }

        if (mode == 'info') {
            this.router.navigate([data.department.departmentID], {relativeTo: this.activatedRoute});
        } else {
            this.router.navigate([data.department.departmentID, 'edit'], {relativeTo: this.activatedRoute});
        }

    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
}
