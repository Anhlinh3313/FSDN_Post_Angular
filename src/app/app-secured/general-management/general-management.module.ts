import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { GeneralManagementRoutingModule } from './general-management.routing';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { TreeTableModule, DataTableModule, DropdownModule, MultiSelectModule, CheckboxModule, CalendarModule, RadioButtonModule} from 'primeng/primeng';

//
import { CountryService, ProvinceService, DistrictService, WardService, DepartmentService, UserService,HubService, RequestShipmentService, ShipmentStatusService, ReasonService, ServiceService, PaymentTypeService, StructureService, PackTypeService, ServiceDVGTService, SizeService, TransportTypeService, TPLService, FormPrintService, HolidayService, RoleService, AccountingAccountService, CashFlowServices } from '../../services';
//
import { ServiceComponent } from './service/service.component';
import { PaymentTypeComponent } from './paymentType/paymentType.component';
import { StructureComponent } from './structure/structure.component';
import { PackTypeComponent } from './packType/packType.component';
import { ServiceDVGTComponent } from "./serviceDVGT/serviceDVGT.component";
import { ReasonComponent } from "./reason/reason.component";
import { SizeComponent } from './size/size.component';
import { SharedModule } from "../../shared/shared.module";
import { TransportTypeComponent } from './transPortType/transPortType.component';
import { PrintModule } from '../print-form/print.module';
import { TableModule } from 'primeng/table';
import { PrintBillManagementComponent } from './print-bill-management/print-bill-management.component';
import { CKEditorModule } from 'ng2-ckeditor';
import { HolidayComponent } from './holiday/holiday.component';
import { ReasonComplainComponent } from './reason-complain/reason-complain.component';
import { AccountBankComponent } from './account-bank/account-bank.component';
import { AccountingAccountComponent } from './accountingAccount/accountingAccount.component';
import { ChangeCODTypeComponent } from './change-cod-type/change-cod-type.component';
import { ChangeCODTypeService } from '../../services/changeCODType.service';
import { CashFlowComponent } from './cash-flow/cash-flow.component';

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
    GeneralManagementRoutingModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    DropzoneModule.forRoot(DROPZONE_CONFIG),
    TreeTableModule,
    SharedModule,
    DataTableModule,
    DropdownModule,
    MultiSelectModule,
    CheckboxModule,
    SharedModule,
    TableModule,
    CKEditorModule,
    CalendarModule,
    RadioButtonModule
  ],
  declarations: [
    ServiceComponent,
    PaymentTypeComponent,
    StructureComponent,
    PackTypeComponent,
    ServiceDVGTComponent,
    ReasonComponent,
    SizeComponent,
    TransportTypeComponent,
    PrintBillManagementComponent,
    HolidayComponent,
    ReasonComplainComponent,
    AccountBankComponent,
    AccountingAccountComponent,
    ChangeCODTypeComponent,
    CashFlowComponent
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
    PaymentTypeService,
    StructureService,
    PackTypeService,
    ServiceDVGTService,
    ReasonService,
    SizeService,
    TransportTypeService,
    TPLService,
    FormPrintService,
    HolidayService,
    RoleService,
    AccountingAccountService,
    ChangeCODTypeService,
    CashFlowServices,
  ]

})
export class GeneralManagementModule { }
//