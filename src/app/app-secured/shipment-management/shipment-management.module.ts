import { GeocodingApiService } from './../../services/geocodingApiService.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { ShipmentManagementRoutingModule } from './shipment-management.routing';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { TreeTableModule, DataTableModule, DropdownModule, MultiSelectModule, CheckboxModule, AutoCompleteModule, DialogModule, InputSwitchModule, TooltipModule, CalendarModule } from 'primeng/primeng';
import { ProgressBarModule } from 'primeng/progressbar';
//
import { CountryService, ProvinceService, DistrictService, WardService, DepartmentService, UserService, HubService, RequestShipmentService, ShipmentStatusService, ReasonService, CustomerService, SizeService, PackTypeService, PaymentTypeService, ServiceDVGTService, ServiceService, StructureService, PriceService, BoxService, ShipmentVersionService, GMapsService, CustomerInfoLogService, PriceListService, PriceServiceService, TransportTypeService, PaymentCODTypeService, FormPrintService, CustomerPaymentToService, ShipmentService, EmailCenterService } from '../../services';
//
import { CreateShipmentComponent } from './create-shipment/create-shipment.component';
import { CreateShipmentExcelComponent } from './create-shipment-excel/create-shipment-excel.component';
import { Daterangepicker } from 'ng2-daterangepicker';
import { GoogleMapsAPIWrapper } from '@agm/core';
import { ShipmentManagementComponent } from "./shipment-management/shipment-management.component";
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SharedModule } from '../../shared/shared.module';
import { GeneralInfoService } from '../../services/generalInfo.service';
import { DeadlinePickupDeliveryService } from '../../services/deadlinePickupDelivery.service';
import { PrintFrormServiceInstance } from '../../services/printTest.serviceInstace';
import { PrintModule } from '../print-form/print.module';
import { TableModule } from 'primeng/table';
import { LayoutModule } from '../layout/layout.module';
import { EntryShipmentServiceInstance } from '../../services/entryShipment.serviceInstace.';
import { CusDepartmentService } from '../../services/cusDepartment.service.';
import { ComponentHelperModule } from '../component-helper/component-helper.module';
import { CommandService } from '../../services/command.service';
import { PanelModule } from 'primeng/panel';
import { KeyFilterModule } from 'primeng/keyfilter';
import { SpinnerModule } from 'primeng/spinner';
import { IncidentManagementComponent } from './incident-management/incident-management.component';
import { ShipmentAwaitingComponent } from './shipment-awaiting/shipment-awaiting.component';
import { SignalRService } from '../../services/signalR.service';
import { UploadExcelHistoryService } from '../../services/uploadExcelHistory.service';
import { AccordionModule } from 'primeng/accordion';     //accordion and accordion tab
import { CurrencyFormatPipe } from '../../pipes/currencyFormat.pipe';
import { ListShipmentComponent } from './list-shipment/list-shipment.component';
import { ShipmentComplainComponent } from './shipment-complain/shipment-complain.component';
import { IncidentsService } from '../../services/incidents.service';
import { ShipmentPrioritizeComponent } from './shipment-prioritize/shipment-prioritize.component';
import { ManagementCompensationComponent } from './management-compensation/management-compensation.component';
// import { DateFormatPipe } from '../../pipes/dateFormat.pipe';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';//
import { FileUploadModule } from 'primeng/fileupload';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ImageViewerModule } from "ngx-image-viewer";
import { ManagementDelayComponent } from './management-delay/management-delay.component';
//
import { CKEditorModule } from 'ng2-ckeditor';
import { CreateShipmentExcelBetaComponent } from './create-shipment-excel-beta/create-shipment-excel-beta.component';
import { ManagementEditCODComponent } from './management-edit-cod/management-edit-cod.component';
import { EditCodComponent } from '../cod-management/edit-cod/edit-cod.component';
import { ChangeCODTypeService } from '../../services/changeCODType.service';
import { ChangeCODService } from '../../services/changeCOD.service';

const DROPZONE_CONFIG: DropzoneConfigInterface = {
  // Change this to your upload POST address:
  url: '',
  maxFilesize: 50,
  acceptedFiles: 'image/*'
};
@NgModule({
  imports: [
    AccordionModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ShipmentManagementRoutingModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    // TooltipModule.forRoot(),
    TooltipModule,
    DropzoneModule.forRoot(DROPZONE_CONFIG),
    TreeTableModule,
    DataTableModule,
    DropdownModule,
    MultiSelectModule,
    CheckboxModule,
    AutoCompleteModule,
    Daterangepicker,
    SharedModule,
    PrintModule,
    TableModule,
    LayoutModule,
    ProgressBarModule,
    DialogModule,
    ComponentHelperModule,
    InputSwitchModule,
    PanelModule,
    KeyFilterModule,
    SpinnerModule,
    CalendarModule,
    TriStateCheckboxModule,
    FileUploadModule,
    OverlayPanelModule,
    ImageViewerModule.forRoot(),
    TriStateCheckboxModule,
    CKEditorModule
  ],
  declarations: [
    CreateShipmentComponent,
    CreateShipmentExcelComponent,
    ShipmentManagementComponent,
    IncidentManagementComponent,
    ShipmentAwaitingComponent,
    ListShipmentComponent,
    ShipmentComplainComponent,
    ShipmentPrioritizeComponent,
    ManagementCompensationComponent,
    ManagementDelayComponent,
    CreateShipmentExcelBetaComponent,
    EditCodComponent
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
    CustomerInfoLogService,
    SizeService,
    PackTypeService,
    PaymentTypeService,
    ServiceService,
    ServiceDVGTService,
    StructureService,
    PriceService,
    BoxService,
    ShipmentVersionService,
    GoogleMapsAPIWrapper,
    GMapsService,
    GeneralInfoService,
    DeadlinePickupDeliveryService,
    GeocodingApiService,
    PrintFrormServiceInstance,
    EntryShipmentServiceInstance,
    CusDepartmentService,
    CommandService,
    PriceListService,
    PriceServiceService,
    SignalRService,
    UploadExcelHistoryService,
    TransportTypeService,
    PaymentCODTypeService,
    FormPrintService,
    CustomerPaymentToService,
    IncidentsService,
    ShipmentService,
    EmailCenterService,
    ChangeCODTypeService,
    ChangeCODService
  ]
})
export class ShipmentManagementModule { }
