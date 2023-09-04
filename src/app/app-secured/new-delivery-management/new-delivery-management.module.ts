import { AgmCoreConfig } from './../../infrastructure/agmCore.config';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule, BsModalRef } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { TreeTableModule, DataTableModule, DropdownModule, MultiSelectModule, CheckboxModule, AutoCompleteModule } from 'primeng/primeng';
//
import {
  CountryService, ProvinceService, DistrictService, WardService, DepartmentService, UserService, HubService, RequestShipmentService,
  ShipmentStatusService, ReasonService, CustomerService, ServiceService, ServiceDVGTService, ListGoodsService, HubRoutingService
} from '../../services';
//

import { AgmCoreModule } from '@agm/core';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { Daterangepicker } from 'ng2-daterangepicker';
import { SharedModule } from "../../shared/shared.module";
import { NewDeliveryManagementRoutingModule } from './new-delivery-management.routing';
import { WaitAssignDeliveryComponent } from './wait-assign-delivery/wait-assign-delivery.component';
import { AssignedDeliveryComponent } from './assigned-delivery/assigned-delivery.component';
import { UpdateDeliveryStatusComponent } from './update-delivery-status/update-delivery-status.component';
import { DeliveryFailComponent } from './delivery-fail/delivery-fail.component';
import { GeneralInfoService } from '../../services/generalInfo.service';
import { ListDeliveryCancelComponent } from './list-delivery-cancel/list-delivery-cancel.component';
import { ListDeliveryCompleteComponent } from './list-delivery-complete/list-delivery-complete.component';
import { PrintModule } from '../print-form/print.module';
import { LayoutModule } from '../layout/layout.module';
import { TableModule } from 'primeng/table';
import { DeleteDeliveryCompleteComponent } from './delete-delivery-complete/delete-delivery-complete.component';
import { EditDeliveryCompleteComponent } from './edit-delivery-complete/edit-delivery-complete.component';
import { DeliveryIssueComponent } from './delivery-issue/delivery-issue.component';
import { TruckService } from '../../services/truck.service';
// import { DateFormatPipe } from '../../pipes/dateFormat.pipe';

const DROPZONE_CONFIG: DropzoneConfigInterface = {
  // Change this to your upload POST address:
  url: '',
  maxFilesize: 50,
  acceptedFiles: 'image/*'
};
@NgModule({
  imports: [
    AgmCoreModule.forRoot(AgmCoreConfig),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NewDeliveryManagementRoutingModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    DropzoneModule.forRoot(DROPZONE_CONFIG),
    TreeTableModule,
    SharedModule,
    DataTableModule,
    DropdownModule,
    AutoCompleteModule,
    MultiSelectModule,
    CheckboxModule,
    Daterangepicker,
    SharedModule,
    PrintModule,
    LayoutModule,
    TableModule
  ],
  declarations: [
    WaitAssignDeliveryComponent,
    AssignedDeliveryComponent,
    UpdateDeliveryStatusComponent,
    DeliveryFailComponent,
    ListDeliveryCancelComponent,
    ListDeliveryCompleteComponent,
    DeleteDeliveryCompleteComponent,
    EditDeliveryCompleteComponent,
    DeliveryIssueComponent,
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
    CustomerService,
    ServiceService,
    ServiceDVGTService,
    ListGoodsService,
    GeneralInfoService,
    HubRoutingService,
    BsModalRef,
    TruckService
  ]
})
export class NewDeliveryManagementModule { }
