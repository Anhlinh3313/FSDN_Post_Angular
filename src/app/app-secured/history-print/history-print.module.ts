import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FollowListComponent } from './follow-list/follow-list.component';
import { ShipmentService, UserService, ListGoodsService, DepartmentService, ReportService } from '../../services';
import { GeneralInfoService } from '../../services/generalInfo.service';
import { LayoutModule } from '../layout/layout.module';
import { PrintModule } from '../print-form/print.module';
import { FormsModule } from '../../../../node_modules/@angular/forms';
import { ModalModule } from '../../../../node_modules/ngx-bootstrap/modal';
import { TreeTableModule, SharedModule, DataTableModule, DropdownModule, MultiSelectModule, CheckboxModule, CalendarModule, SplitButtonModule } from '../../../../node_modules/primeng/primeng';
import { DropzoneModule, DropzoneConfigInterface } from '../../../../node_modules/ngx-dropzone-wrapper';
import { TableModule } from '../../../../node_modules/primeng/table';
import { Daterangepicker } from '../../../../node_modules/ng2-daterangepicker';
import { HistotyPrintRoutingModule } from './history-print.module.routing';
import { TooltipModule } from '../../../../node_modules/ngx-bootstrap/tooltip';
import { ReportPrintShipmentComponent } from './report-print-shipment/report-print-shipment.component';

const DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: "''",
  maxFilesize: 50,
  acceptedFiles: "image/*"
};
@NgModule({
  imports: [
    PrintModule,
    CommonModule,
    FormsModule,
    HistotyPrintRoutingModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    DropzoneModule.forRoot(DROPZONE_CONFIG),
    SharedModule,
    TableModule,
    DataTableModule,
    DropdownModule,
    MultiSelectModule,
    CheckboxModule,
    CalendarModule,
    Daterangepicker,
    LayoutModule,
    SplitButtonModule
  ],
  declarations: [
    FollowListComponent,
    ReportPrintShipmentComponent
  ],
  entryComponents: [
  ],
  providers: [
    ShipmentService,
    UserService,
    ListGoodsService,
    GeneralInfoService,
    DepartmentService,
    ReportService
  ]
})
export class HistoryPrintModule { }
