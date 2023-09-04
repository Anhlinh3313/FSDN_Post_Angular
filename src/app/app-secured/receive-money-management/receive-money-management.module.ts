import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { ReceiptMoneyManagementRoutingModule } from './receive-money-management.routing';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { TreeTableModule, DataTableModule, DropdownModule, MultiSelectModule, CalendarModule, LightboxModule, RadioButtonModule, AutoCompleteModule } from 'primeng/primeng';
import { InplaceModule } from 'primeng/inplace';
//
import { CountryService, ProvinceService, DistrictService, WardService, DepartmentService, UserService, HubService, RequestShipmentService, ShipmentStatusService, ReasonService, CodService, ServiceDVGTService, ShipmentService, UploadService, CashFlowServices } from '../../services';
//
import { ReceiveMoneyFromHubComponent } from "./receive-money-from-hub/receive-money-from-hub.component";
import { ReceiveMoneyFromRiderComponent } from "./receive-money-from-rider/receive-money-from-rider.component";
import { ReceiveMoneyFromAccountantComponent } from "./receive-money-from-accountant/receive-money-from-accountant.component";
import { ConfirmMoneyFromHubComponent } from "./confirm-money-from-hub/confirm-money-from-hub.component";
import { ConfirmMoneyFromAccountantComponent } from "./confirm-money-from-accountant/confirm-money-from-accountant.component";
import { Daterangepicker } from 'ng2-daterangepicker';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ListReceiptMoney } from '../../models/index';
import { ListReceiptMoneyService } from '../../services/receiptMoney.service.';
import { ConfirmMoneyFromEmpComponent } from "./confirm-money-from-emp/confirm-money-from-emp.component";
import { ConfirmMoneyFromHubOtherComponent } from './confirm-money-from-hub-other/confirm-money-from-hub-other.component';
import { ReceiveMoneyFromHubOtherComponent } from './receive-money-from-hub-other/receive-money-from-hub-other.component';
import { TableModule } from 'primeng/table';
import { ConfirmTransferComponent } from './confirm-transfer/confirm-transfer.component';
import { CheckboxModule } from 'primeng/checkbox';
// import { DateFormatPipe } from '../../pipes/dateFormat.pipe';
import { PrintModule } from '../print-form/print.module';
import { ReceiveMoneyDetailComponent } from './receive-money-detail/receive-money-detail.component';
import { CurrencyFormatPipe } from '../../pipes/currencyFormat.pipe';
import { ImageViewerModule } from 'ngx-image-viewer';
import { SharedModule } from '../../shared/shared.module';
// import { CurrencyFormatterDirective } from '../../shared/directives/currencyFormat.directive';
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
    ReceiptMoneyManagementRoutingModule,
    CheckboxModule,
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
    TabsModule.forRoot(),
    TableModule,
    InplaceModule,
    LightboxModule,
    RadioButtonModule,
    AutoCompleteModule,
    ImageViewerModule.forRoot(),
  ],
  declarations: [
    ReceiveMoneyFromRiderComponent,
    ReceiveMoneyFromHubComponent,
    ReceiveMoneyFromAccountantComponent,
    ReceiveMoneyFromHubOtherComponent,
    ConfirmMoneyFromHubComponent,
    ConfirmMoneyFromAccountantComponent,
    ConfirmMoneyFromHubOtherComponent,
    ConfirmTransferComponent,
    ReceiveMoneyDetailComponent,
    ConfirmMoneyFromEmpComponent,
    // CurrencyFormatterDirective
    // DateFormatPipe
    // CurrencyFormatPipe,
  ],
  entryComponents: [
    ReceiveMoneyDetailComponent
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
    ShipmentService,
    ReasonService,
    ShipmentStatusService,
    ListReceiptMoneyService,
    ServiceDVGTService,
    UploadService,
    CashFlowServices
  ]

})
export class ReceiveMoneyManagementModule { }
