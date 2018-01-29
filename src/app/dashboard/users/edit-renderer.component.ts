import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'child-cell',
    template: `<span><button type="button" rel="tooltip" (click)="invokeParentMethod()" class="btn btn-default"><i class="material-icons">portrait</i></button></span>`,
    styles: [
        `.btn {
            line-height: 0.5;
            padding: 0px 0px;
        }
        [data-background-color=orange] {
            background: linear-gradient(60deg,#f0ad4e,#eea236);
        }
        `

    ]
})
export class EditRendererComponent implements ICellRendererAngularComp {
    public params: any;

    agInit(params: any): void {
        this.params = params;
    }

    public invokeParentMethod() {
        // this.params.context.componentParent.onEdit(`Row: ${this.params.node.rowIndex}, Col: ${this.params.colDef.headerName}`)
        this.params.context.componentParent.onDisplayUserDetails(this.params.node.rowIndex)

    }

    refresh(): boolean {
        return false;
    }
}
