import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { TreeTableModule, DataTableModule, SharedModule, DropdownModule, MultiSelectModule, CalendarModule, CheckboxModule, InputSwitchModule, AutoCompleteModule, ProgressBarModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';

//
import { CountryService, ProvinceService, DistrictService, WardService, DepartmentService, UserService, HubService, RequestShipmentService, ShipmentStatusService, ReasonService, CodService, CustomerService } from '../../services';
//
import { Daterangepicker } from 'ng2-daterangepicker';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ListCustomerPaymentService } from '../../services/listcustomerpayment.service';
import { CustomerPaymentManagementRoutingModule } from './customer-payment-management.routing';
import { CustomerPaymentTotalPriceComponent } from './customer-payment-totalprice/customer-payment-totalprice.component';
import { CustomerPaymentCODComponent } from './customer-payment-cod/customer-payment-cod.component';
import { GeneralInfoService } from '../../services/generalInfo.service';
import { ConvertNumberToText } from '../../infrastructure/convertNumberToText';
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
    CheckboxModule,
    CustomerPaymentManagementRoutingModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    DropzoneModule.forRoot(DROPZONE_CONFIG),
    TreeTableModule,
    SharedModule,
    DataTableModule,
    TableModule,
    DropdownModule,
    MultiSelectModule,
    CalendarModule,
    Daterangepicker,  //DateRangePicker
    TabsModule.forRoot(),
    InputSwitchModule,
    AutoCompleteModule,
    ProgressBarModule
  ],
  declarations: [
    CustomerPaymentTotalPriceComponent,
    CustomerPaymentCODComponent
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
    ListCustomerPaymentService,
    CustomerService,
    ConvertNumberToText,
    GeneralInfoService
  ]

})
export class CustomerPaymentManagementModule { }
