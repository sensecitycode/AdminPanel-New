import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
    selector: 'child-cell',
    template: `<span><button type="button" rel="tooltip" (click)="invokeParentMethod()" class="bs3-btn bs3-btn-default"><i class="material-icons">content_paste</i></button></span>`,
    styles: [
        `.bs3-btn {
            line-height: 0.5;
            padding: 0px 0px;
        }
        [data-background-color=orange] {
            background: linear-gradient(60deg,#f0ad4e,#eea236);
        }
        `

    ]
})
export class depEditRendererComponent implements ICellRendererAngularComp {
    public params: any;

    agInit(params: any): void {
        this.params = params;
    }

    public invokeParentMethod() {
        // this.params.context.componentParent.onEdit(`Row: ${this.params.node.rowIndex}, Col: ${this.params.colDef.headerName}`)
        this.params.context.componentParent.onDisplayDepartmentDetails(this.params.node.rowIndex)

    }

    refresh(): boolean {
        return false;
    }
}
