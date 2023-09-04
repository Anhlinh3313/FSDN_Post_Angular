import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
// import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { NewPickupManagementRoutingModule } from './new-pickup-management.routing';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { TreeTableModule, DataTableModule, DropdownModule, MultiSelectModule, CalendarModule, CheckboxModule, AutoCompleteModule, InputSwitch, InputSwitchModule } from 'primeng/primeng';
//
import { CountryService, ProvinceService, DistrictService, WardService, DepartmentService, UserService,HubService, RequestShipmentService, 
  ShipmentStatusService, ReasonService, CustomerService, ServiceService, ServiceDVGTService, CustomerInfoLogService, GeocodingApiService } from '../../services';
//

import {InputTextModule} from 'primeng/inputtext';
import {TooltipModule} from 'primeng/tooltip';

import { AgmCoreModule } from '@agm/core';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { Daterangepicker } from 'ng2-daterangepicker';
import { SharedModule } from "../../shared/shared.module";
import { WaitAssignPickupComponent } from './wait-assign-pickup/wait-assign-pickup.component';
import { AssignedPickupComponent } from './assigned-pickup/assigned-pickup.component';
import { ListPickingComponent } from './list-picking/list-picking.component';
import { ListPickupCancelComponent } from './list-pickup-cancel/list-pickup-cancel.component';
import { ListPickupCompleteComponent } from './list-pickup-complete/list-pickup-complete.component';
import { GeneralInfoService } from '../../services/generalInfo.service';
import { AgmCoreConfig } from '../../infrastructure/agmCore.config';
import { LayoutModule } from '../layout/layout.module';
import { TableModule } from 'primeng/table';
// import { DateFormatPipe } from '../../pipes/dateFormat.pipe';
import { PrintModule } from '../print-form/print.module';
import { CreateRequestComponent } from './create-request/create-request.component';
import { StreetService } from '../../services/street.service';
import { CusDepartmentService } from '../../services/cusDepartment.service.';
import { RequestManagementComponent } from '../request-management/request-management/request-management.component';
import { DetailRequestShipmentComponent } from '../request-management/detail-request-shipment/detail-request-management.component';

const DROPZONE_CONFIG: DropzoneConfigInterface = {
  // Change this to your upload POST address:
  url: '',
  maxFilesize: 50,
  acceptedFiles: 'image/*'
};
@NgModule({
  imports: [
    PrintModule,
    AgmCoreModule.forRoot(AgmCoreConfig),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NewPickupManagementRoutingModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    TooltipModule,
    DropzoneModule.forRoot(DROPZONE_CONFIG),
    TreeTableModule,
    SharedModule,
    DataTableModule,
    DropdownModule,
    AutoCompleteModule,
    MultiSelectModule,
    CheckboxModule,
    Daterangepicker,
    LayoutModule,
    TableModule,
    InputTextModule,
    InputSwitchModule,
    CalendarModule,
  ],
  declarations: [
    CreateRequestComponent,
    WaitAssignPickupComponent,
    AssignedPickupComponent,
    ListPickingComponent,
    ListPickupCancelComponent,
    ListPickupCompleteComponent,
    DetailRequestShipmentComponent,
    RequestManagementComponent,
  ],
  entryComponents: [
    //DetailRequestShipmentComponent
  ],
  providers: [
    CustomerInfoLogService,
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
    CustomerService,
    ServiceService,
    ServiceDVGTService,
    GeneralInfoService,
    GeocodingApiService,
    StreetService,
    CusDepartmentService
  ]
})
export class NewPickupManagementModule { }
