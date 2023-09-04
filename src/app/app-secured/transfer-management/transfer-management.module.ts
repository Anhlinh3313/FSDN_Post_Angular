import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { TransferManagementRoutingModule } from './transfer-management.routing';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { Daterangepicker } from 'ng2-daterangepicker';
import { TreeTableModule, DataTableModule, SharedModule, DropdownModule, MultiSelectModule, CheckboxModule, AutoCompleteModule, InputSwitchModule, CalendarModule, SpinnerModule, DialogModule, ProgressBarModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
//
import { CountryService, ProvinceService, DistrictService, WardService, DepartmentService, UserService, HubService, RequestShipmentService, ShipmentStatusService, ReasonService, AuthService, TPLService, ListGoodsService, ServiceService, CustomerService, ListGoodsStatusService, PackageService } from '../../services';
//
import { TransferIssueComponent } from './transfer-issue/transfer-issue.component';
import { TransferComponent } from './transfer/transfer.component';
import { TransferListComponent } from "./transfer-list/transfer-list.component";
import { TransferReceiveComponent } from "./transfer-receive/transfer-receive.component";
import { TransferReshipComponent } from "./transfer-reship/transfer-reship.component";
import { TransferHistoryComponent } from "./transfer-history/transfer-history.component";
import { GeneralInfoService } from '../../services/generalInfo.service';
import { PrintModule } from '../print-form/print.module';
import { TransportTypeService } from '../../services/transportType.service';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { LayoutModule } from '../layout/layout.module';
import { ListProcessErrorComponent } from './list-process-error/list-process-error.component';
import { ListReceivedErrorComponent } from './list-received-error/list-received-error.component';
import { TruckScheduleService } from '../../services/truckSchedule.service';
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
    CommonModule,
    FormsModule,
    TransferManagementRoutingModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    DropzoneModule.forRoot(DROPZONE_CONFIG),
    TabsModule.forRoot(),
    TreeTableModule,
    SharedModule,
    DataTableModule,
    DropdownModule,
    MultiSelectModule,
    CheckboxModule,
    Daterangepicker,
    AutoCompleteModule,
    PrintModule,
    LayoutModule,
    TableModule,
    InputSwitchModule,
    CalendarModule,
    SpinnerModule,
    ProgressBarModule,
    DialogModule
  ],
  declarations: [
    TransferIssueComponent,
    TransferComponent,
    TransferListComponent,
    TransferReceiveComponent,
    TransferReshipComponent,
    TransferHistoryComponent,
    ListProcessErrorComponent,
    ListReceivedErrorComponent,
    // DateFormatPipe
  ],
  entryComponents: [
  ],
  providers: [
    TruckService,
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
    GeneralInfoService,
    TransportTypeService,
    TPLService,
    ListGoodsService,
    AuthService,
    ServiceService,
    CustomerService,
    ListGoodsStatusService,
    TruckScheduleService,
    PackageService
  ]

})
export class TransferManagementModule { }
