import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { WarehouseManagementRoutingModule } from './Warehouse-management.routing';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { TreeTableModule, DataTableModule, SharedModule, DropdownModule, MultiSelectModule, CheckboxModule, InputSwitchModule, TabViewModule, SpinnerModule, CalendarModule, ProgressBarModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { Daterangepicker } from 'ng2-daterangepicker';
//
import { CountryService, ProvinceService, DistrictService, WardService, DepartmentService, UserService, HubService, RequestShipmentService, ShipmentStatusService, ReasonService, ServiceService, AuthService, ListGoodsService, CustomerService, PackTypeService, FormPrintService, ShipmentService, ReportService, PackageService } from '../../services';
//
import { InventoryComponent } from './inventory/inventory.component';
import { WarehousingComponent } from './warehousing/warehousing.component';
import { WarehousingRequestComponent } from './warehousingRequest/warehousingRequest.component';
import { AutoCompleteModule } from 'primeng/components/autocomplete/autocomplete';
import { WareHousingCheckComponent } from './wareHousingCheck/wareHousingCheck.component';
// import { DateFormatPipe } from '../../pipes/dateFormat.pipe';
import { PrintModule } from '../print-form/print.module';
import { GeneralInfoService } from '../../services/generalInfo.service';
import { ListGoodsTypeService } from '../../services/listGoodsType.service';
import { LayoutModule } from '../layout/layout.module';
import { IssueHistoryComponent } from './issue-history/issue-history.component';
import { PrintFrormServiceInstance } from '../../services/printTest.serviceInstace';
import { WareHousingHistoryComponent } from './ware-housing-history/ware-housing-history.component';

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
    WarehouseManagementRoutingModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    DropzoneModule.forRoot(DROPZONE_CONFIG),
    TreeTableModule,
    SharedModule,
    DataTableModule,
    TableModule,
    DropdownModule,
    MultiSelectModule,
    Daterangepicker,  //DateRangePicker
    AutoCompleteModule,
    CheckboxModule,
    InputSwitchModule,
    TabViewModule,
    LayoutModule,
    SpinnerModule,
    ProgressBarModule,
    CalendarModule
  ],
  declarations: [
    InventoryComponent,
    WarehousingComponent,
    WarehousingRequestComponent,
    WareHousingCheckComponent,
    IssueHistoryComponent,
    WareHousingHistoryComponent,
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
    AuthService,
    GeneralInfoService,
    ListGoodsService,
    ListGoodsTypeService,
    CustomerService,
    PackTypeService,
    FormPrintService,
    PrintFrormServiceInstance,
    ShipmentService,
    ReportService,
    PackageService
  ]

})
export class WarehouseManagementModule { }
