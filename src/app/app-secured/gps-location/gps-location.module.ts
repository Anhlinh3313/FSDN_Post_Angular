import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '../layout/layout.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SimpleTimer } from 'ng2-simple-timer';
import { AutoCompleteModule, DataTableModule, RadioButtonModule, TreeTableModule, DropdownModule, MultiSelectModule, CalendarModule, CheckboxModule, InputSwitchModule, TabViewModule, PanelModule, BlockUIModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
//
import { UserService, AuthService, ShipmentService, RequestShipmentService, ShipmentVersionService, CustomerService, ProvinceService, DistrictService, WardService, HubService, ReasonService, ShipmentStatusService, ListGoodsService, UploadService, GeocodingApiService, BoxService } from '../../services/index';
import { GPSLocationComponent } from '../gps-location/gps-location.component';
import { AgmCoreModule } from '@agm/core';
import { Daterangepicker } from 'ng2-daterangepicker';
import { GeneralInfoService } from '../../services/generalInfo.service';
import { DepartmentService } from '../../services/department.service';
import { AgmCoreConfig } from '../../infrastructure/agmCore.config';
import { PrintFrormServiceInstance } from '../../services/printTest.serviceInstace';
import { PrintModule } from '../print-form/print.module';
import { EntryShipmentServiceInstance } from '../../services/entryShipment.serviceInstace.';

import { PersistenceModule } from 'angular-persistence';
import { ListReceiptMoneyService } from '../../services/receiptMoney.service.';
import { SignalRService } from '../../services/signalR.service';
import { EventListenerServiceInstance } from '../../services/eventListener.serviceInstance';
import { GpsLocationRoutingModule } from './gps-location.routing';
import { ShipmentAllDetailComponent } from '../shipment-all-detail/shipment-all-detail.component';
//import { DetailRequestShipmentComponent } from '../request-management/detail-request-shipment/detail-request-management.component';
import { HistoryPickupComponent } from '../pickup-management/history-pickup/historypickup.component';
import { DetailShipmentVersionComponent } from '../shipment-management/detail-shipment-management/detail-shipment-version/detail-shipment-version.component';
import { DetailShipmentManagementComponent } from '../shipment-management/detail-shipment-management/detail-shipment-management.component';
import { CancelShipmentComponent } from '../shipment-management/cancel-shipment/cancel-shipment.component';
import { DetailShipmentNotCompleteComponent } from '../shipment-management/detail-shipment-not-complete/detail-shipment-not-complete.component';
// import { DateFormatPipe } from '../pipes/dateFormat.pipe';

@NgModule({
  imports: [
    PrintModule,
    AgmCoreModule.forRoot(AgmCoreConfig),
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    GpsLocationRoutingModule,
    LayoutModule,
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    AutoCompleteModule,
    NgxDatatableModule,
    DataTableModule,
    TableModule,
    RadioButtonModule,
    TreeTableModule,
    DropdownModule,
    MultiSelectModule,
    CalendarModule,
    CheckboxModule,
    Daterangepicker,
    InputSwitchModule,
    PersistenceModule,
    TabViewModule,
    PanelModule,
    BlockUIModule
  ],
  declarations: [
    // DateFormatPipe,
    GPSLocationComponent,
    ShipmentAllDetailComponent,
    HistoryPickupComponent,
    DetailShipmentVersionComponent,
    DetailShipmentManagementComponent,
    CancelShipmentComponent,
    DetailShipmentNotCompleteComponent,
    //DetailRequestShipmentComponent
  ],
  providers: [
    SimpleTimer,
    UserService,
    AuthService,
    ShipmentService,
    RequestShipmentService,
    ShipmentVersionService,
    CustomerService,
    ProvinceService,
    DistrictService,
    WardService,
    HubService,
    ReasonService,
    ShipmentStatusService,
    ListGoodsService,
    GeneralInfoService,
    UploadService,
    DepartmentService,
    PrintFrormServiceInstance,
    EntryShipmentServiceInstance,
    ListReceiptMoneyService,
    GeocodingApiService,
    BoxService,
    SignalRService,
    EventListenerServiceInstance,
  ],
  entryComponents: [
    ShipmentAllDetailComponent,
    //DetailRequestShipmentComponent,
  ],
  exports: [
    // DateFormatPipe
  ],
})
export class GpsLocationModule { }
