import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { Daterangepicker } from 'ng2-daterangepicker';
import { TreeTableModule, DataTableModule, SharedModule, DropdownModule, MultiSelectModule, CheckboxModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
//
import { TPLService, ShipmentService, ShipmentStatusService, PriceListService, PriceService, ServiceDVGTService } from '../../services';
import { TPLManagementRoutingModule } from './tpl-management.routing';
//
import { TPLComponent } from './tpl/tpl.component';
import { ShipmentAssignToTPL } from './shipment-assign-to-tpl/shipment-assign-to-tpl.component';
import { UpdateScheduleComponent } from './update-schedule/update-schedule.component';
import { TPLShipmentComponent } from './tpl-shipment/tpl-shipment.component';
// import { DateFormatPipe } from '../../pipes/dateFormat.pipe';
import { PrintModule } from '../print-form/print.module';

const DROPZONE_CONFIG: DropzoneConfigInterface = {
  // Change this to your upload POST address:
  url: '',
  maxFilesize: 50,
  acceptedFiles: 'image/*'
};
@NgModule({
  imports: [
    PrintModule,
    CommonModule,
    FormsModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    DropzoneModule.forRoot(DROPZONE_CONFIG),
    TreeTableModule,
    SharedModule,
    DataTableModule,
    DropdownModule,
    MultiSelectModule,
    Daterangepicker,
    TPLManagementRoutingModule,
    TableModule,
    CheckboxModule
  ],
  declarations: [
    TPLComponent,
    ShipmentAssignToTPL,
    UpdateScheduleComponent,
    TPLShipmentComponent,
    // DateFormatPipe
  ],
  entryComponents: [
  ],
  providers: [
    ShipmentService,
    TPLService,
    ShipmentStatusService,
    PriceListService,
    PriceService,
    ServiceDVGTService
  ]

})
export class TPLManagementModule { }