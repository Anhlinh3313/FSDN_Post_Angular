import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from './layout/layout.module';
import { SimpleTimer } from 'ng2-simple-timer';
import { SharedModule } from '../shared/shared.module';
import { DataTableModule, RadioButtonModule, InputSwitchModule, TabViewModule, PanelModule, BlockUIModule, AutoCompleteModule, DropdownModule, CheckboxModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
//
import { AppSecuredComponent } from './app-secured.component';
import { AuthService, ShipmentService, RequestShipmentService, HubService, UploadService, BoxService, PriceService } from '../services/index';
import { ShipmentDetailComponent } from './shipment-detail/shipment-detail.component';
import { RequestDetailComponent } from './request-detail/request-detail.component';
import { AgmCoreModule } from '@agm/core';
import { GeneralInfoService } from '../services/generalInfo.service';
import { AgmCoreConfig } from '../infrastructure/agmCore.config';
import { HelloComponent } from './hello/hello.component';
import { SignalRService } from '../services/signalR.service';
import { EventListenerServiceInstance } from '../services/eventListener.serviceInstance';
import { AppSecuredRoutingModule } from './app-secured.routing';
import { ListReceiptMoneyService } from '../services/receiptMoney.service.';
import { GetLatLngComponent } from './get-lat-lng/get-lat-lng.component';
import { Daterangepicker } from 'ng2-daterangepicker';
import { TabsModule } from 'ngx-bootstrap';
import { AccordionModule } from 'primeng/accordion';
import { LightboxModule } from 'primeng/lightbox';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CarouselModule } from 'primeng/carousel';
import { TooltipModule } from 'primeng/tooltip';
import { ImageViewerModule } from "ngx-image-viewer";

@NgModule({
  imports: [
    AgmCoreModule.forRoot(AgmCoreConfig),
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    AppSecuredRoutingModule,
    LayoutModule,
    SharedModule,
    DataTableModule,
    TableModule,
    RadioButtonModule,
    InputSwitchModule,
    TabViewModule,
    PanelModule,
    BlockUIModule,
    AutoCompleteModule,
    DropdownModule,
    CheckboxModule,
    Daterangepicker,
    TabsModule,
    TabViewModule,
    AccordionModule,
    LightboxModule,
    OverlayPanelModule,
    CarouselModule,
    ImageViewerModule.forRoot(),
    TooltipModule
  ],
  declarations: [
    AppSecuredComponent,
    ShipmentDetailComponent,
    RequestDetailComponent,
    HelloComponent,
    GetLatLngComponent,
  ],
  providers: [
    SimpleTimer,
    AuthService,
    ShipmentService,
    RequestShipmentService,
    GeneralInfoService,
    SignalRService,
    EventListenerServiceInstance,
    HubService,
    UploadService,
    ListReceiptMoneyService,
    BoxService,
    PriceService,
  ],
  entryComponents: [
    ShipmentDetailComponent,
    RequestDetailComponent,
  ],
  exports: [
  ],
})
export class AppSecuredModule { }
