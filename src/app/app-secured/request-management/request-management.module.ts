import { GeocodingApiService } from './../../services/geocodingApiService.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { RequestManagementRoutingModule } from './request-management.routing';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { TreeTableModule, DataTableModule, DropdownModule, MultiSelectModule, AutoCompleteModule, CheckboxModule } from 'primeng/primeng';
//
import {
  CountryService, ProvinceService, DistrictService, WardService, DepartmentService, UserService, HubService, RequestShipmentService,
  ShipmentStatusService, ReasonService, CustomerService, ServiceService, ServiceDVGTService, CustomerInfoLogService
} from '../../services';
//
import { UpdateRequestComponent } from "./update-request/update-request.component";

import { TabsModule } from 'ngx-bootstrap/tabs';
import { Daterangepicker } from 'ng2-daterangepicker';
import { SharedModule } from "../../shared/shared.module";
import { LayoutModule } from '../layout/layout.module';
import { TableModule } from 'primeng/table';
// import { DateFormatPipe } from '../../pipes/dateFormat.pipe';
import { PrintModule } from '../print-form/print.module';
import { StreetService } from '../../services/street.service';
import { CusDepartmentService } from '../../services/cusDepartment.service.';
import { ShipmentDetailComponent } from '../shipment-detail/shipment-detail.component';
//mport { DetailRequestShipmentComponent } from './detail-request-shipment/detail-request-management.component';

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
    ReactiveFormsModule,
    RequestManagementRoutingModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    DropzoneModule.forRoot(DROPZONE_CONFIG),
    TreeTableModule,
    DataTableModule,
    DropdownModule,
    MultiSelectModule,
    Daterangepicker,
    AutoCompleteModule,
    SharedModule,
    LayoutModule,
    TableModule,
    CheckboxModule,
  ],
  declarations: [
    UpdateRequestComponent,
    //DetailRequestShipmentComponent
    // DateFormatPipe
  ],
  entryComponents: [
    ShipmentDetailComponent
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
    CustomerService,
    CustomerInfoLogService,
    ServiceService,
    ServiceDVGTService,
    GeocodingApiService,
    StreetService,
    CusDepartmentService
  ]
})
export class RequestManagementModule { }
