import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DeliveryManagementRoutingModule } from './Delivery-management.routing';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { TreeTableModule, DataTableModule, SharedModule, DropdownModule, MultiSelectModule } from 'primeng/primeng';
import { Daterangepicker } from 'ng2-daterangepicker';
//
import { CountryService, ProvinceService, DistrictService, WardService, DepartmentService, UserService,HubService, RequestShipmentService, ShipmentStatusService, ReasonService, ServiceService } from '../../services';
//
import { UpdateDeliveryStatusComponent } from './update-delivery-status/update-delivery-status.component';
import { DeliveryMagementComponent } from './delivery-managment/delivery-management.component';
import { DeliveryHistoryComponent } from './delivery-history/delivery-history.component';
import { PrintDataDeliveryComponent } from "./delivery-managment/print-data-delivery.component";
import { PrintUpdateDeliveryComponent } from "./update-delivery-status/print-update-delivery.component";
import { TabsModule } from 'ngx-bootstrap/tabs';
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
    DeliveryManagementRoutingModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    DropzoneModule.forRoot(DROPZONE_CONFIG),
    TreeTableModule,
    SharedModule,
    DataTableModule,
    DropdownModule,
    MultiSelectModule,
    Daterangepicker,  //DateRangePicker
  ],
  declarations: [
    DeliveryMagementComponent,
    UpdateDeliveryStatusComponent,
    DeliveryHistoryComponent,
    PrintDataDeliveryComponent,
    PrintUpdateDeliveryComponent,
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
    ServiceService,
  ]

})
export class DeliveryManagementModule { }
