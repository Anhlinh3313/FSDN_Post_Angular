import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { PackManagementRoutingModule } from './pack-management.routing';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { TreeTableModule, DataTableModule, DropdownModule, MultiSelectModule, AutoCompleteModule, CalendarModule, ProgressBarModule } from 'primeng/primeng';
//
import { CountryService, ProvinceService, DistrictService, WardService, DepartmentService, UserService, HubService, RequestShipmentService, ShipmentStatusService, ReasonService, PackageService, ServiceService, FormPrintService } from '../../services';
//
import { PackComponent } from './pack/pack.component';
import { OpenPackComponent } from "./open-pack/openPack.component";
import { SharedModule } from "../../shared/shared.module";
import { LayoutModule } from '../layout/layout.module';
// import { DateFormatPipe } from '../../pipes/dateFormat.pipe';
import { PrintModule } from '../print-form/print.module';
import { TableModule } from '../../../../node_modules/primeng/table';
import { ListPackageComponent } from './list-package/list-package.component';
import { PrintFrormServiceInstance } from '../../services/printTest.serviceInstace';

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
    PackManagementRoutingModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    DropzoneModule.forRoot(DROPZONE_CONFIG),
    TreeTableModule,
    SharedModule,
    DataTableModule,
    DropdownModule,
    MultiSelectModule,
    SharedModule,
    LayoutModule,
    AutoCompleteModule,
    CalendarModule,
    ProgressBarModule,
    TableModule
  ],
  declarations: [
    PackComponent,
    OpenPackComponent,
    ListPackageComponent,
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
    PrintFrormServiceInstance,
    PackageService,
    ServiceService,
    FormPrintService
  ]

})
export class PackManagementModule { }
