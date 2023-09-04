import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { PickupManagementRoutingModule } from './pickup-management.routing';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { TreeTableModule, DataTableModule, SharedModule, DropdownModule, MultiSelectModule } from 'primeng/primeng';

import { CalendarModule } from 'primeng/components/calendar/calendar';
import { Daterangepicker } from 'ng2-daterangepicker';
//
import { CountryService, ProvinceService, DistrictService, WardService, DepartmentService, UserService, HubService, RequestShipmentService, ShipmentStatusService, ReasonService } from '../../services';
//
import { PickupComponent } from './pickup/pickup.component';
import { UpdatePickupStatusComponent } from './update-pickup-status/update-pickup-status.component';
import { PrintUpdatePickupComponent } from "./update-pickup-status/print-update-pickup.component";
import { WindowRef } from '../../shared/services/windowRef';
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
    PickupManagementRoutingModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    DropzoneModule.forRoot(DROPZONE_CONFIG),
    TreeTableModule,
    SharedModule,
    DataTableModule,
    DropdownModule,
    MultiSelectModule,
    CalendarModule,
    Daterangepicker,  //DateRangePicker
  ],
  declarations: [
    PickupComponent,
    UpdatePickupStatusComponent,
    PrintUpdatePickupComponent,
    // DateFormatPipe
  ],
  entryComponents: [
  ],
  providers: [
    CountryService,
    ProvinceService,
    DistrictService,
    WardService,
    DepartmentService,
    UserService,
    HubService,
    RequestShipmentService,
    ReasonService,
    ShipmentStatusService,
    WindowRef, 
  ]

})
export class PickupManagementModule { }
