import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { ReturnManagementRoutingModule } from './return-management.routing';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { TreeTableModule, DataTableModule, SharedModule, DropdownModule, MultiSelectModule } from 'primeng/primeng';
//
import { CountryService, ProvinceService, DistrictService, WardService, DepartmentService, UserService, HubService, RequestShipmentService, ShipmentStatusService, ReasonService, ListGoodsService } from '../../services';
//
import { ReturnComponent } from './return-new/return-new.component';
import { UpdateReturnStatusComponent } from './update-return-status/update-return-status.component';
import { ReturnHistoryComponent } from './return-history/return-history.component';
import { AcceptReturnComponent } from './accept-return/accept-return.component';
import { Daterangepicker } from 'ng2-daterangepicker';
import { GeneralInfoService } from '../../services/generalInfo.service';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PrintModule } from '../print-form/print.module';
import { CancelReturnComponent } from './cancel-return/cancel-return.component';
import { LayoutModule } from '../layout/layout.module';
import { WaitReturnComponent } from './wait-return/wait-return.component';
import {CalendarModule} from 'primeng/calendar';

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
    ReturnManagementRoutingModule,
    TabsModule  .forRoot(),
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    DropzoneModule.forRoot(DROPZONE_CONFIG),
    TreeTableModule,
    SharedModule,
    DataTableModule,
    DropdownModule,
    MultiSelectModule,
    Daterangepicker,
    TableModule,
    PrintModule,
    LayoutModule,
    CalendarModule
  ],
  declarations: [
    ReturnComponent,
    UpdateReturnStatusComponent,
    ReturnHistoryComponent,
    AcceptReturnComponent,
    CancelReturnComponent,
    WaitReturnComponent,
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
    GeneralInfoService,
    ListGoodsService,
  ]

})
export class ReturnManagementModule { }
