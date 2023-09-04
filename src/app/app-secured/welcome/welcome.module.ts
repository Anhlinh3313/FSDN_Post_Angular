import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SimpleTimer } from 'ng2-simple-timer';
import { SharedModule } from '../../shared/shared.module';
import { AutoCompleteModule, DataTableModule, ChartModule, RadioButtonModule, TreeTableModule, DropdownModule, MultiSelectModule, CalendarModule, CheckboxModule, InputSwitchModule, TabViewModule, PanelModule, BlockUIModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
//
import { WelcomeComponent } from './welcome.component';
import { UserService, AuthService, ShipmentService, RequestShipmentService, ShipmentVersionService, CustomerService, ProvinceService, DistrictService, WardService, HubService, ReasonService, ShipmentStatusService, ListGoodsService, UploadService, GeocodingApiService, BoxService, ReportService } from '../../services/index';
import { AgmCoreModule } from '@agm/core';
import { TotalNewRequestComponent } from "./pickup/total-new-request/total-new-request.component";
import { TotalAssignedPickupComponent } from "./pickup/total-assigned-pickup/total-assigned-pickup.component";
import { TotalPickingComponent } from "./pickup/total-picking/total-picking.component";
import { TotalWaitRoutingComponent } from './transfer/total-wait-routing/total-wait-routing.component';
import { TotalRoutedComponent } from './transfer/total-routed/total-routed.component';
import { TotalTransferPOFromComponent } from './transfer/total-transfer-POFrom/total-transfer-pofrom.component';
import { TotalTransferPOToComponent } from './transfer/total-transfer-POTo/total-transfer-poto.component';
import { TotalDeliveryComponent } from './delivery/total-delivery/total-delivery.component';
import { TotalUncompleteComponent } from './delivery/total-uncomplete/total-uncomplete.component';
import { TotalCompleteComponent } from './delivery/total-complete/total-complete.component';
import { TotalReturnComponent } from './return/total-return/total-return.component';
import { TotalInventoryComponent } from './inventory/total-inventory/total-inventory.component';
import { TotalWeightInventoryComponent } from './inventory/total-weight-inventory/total-weight-inventory.component';
import { TotalUnprocessedComponent } from './inventory/total-unprocessed/total-unprocessed.component';
import { Daterangepicker } from 'ng2-daterangepicker';
import { GeneralInfoService } from '../../services/generalInfo.service';
import { DepartmentService } from '../../services/department.service';
import { AgmCoreConfig } from '../../infrastructure/agmCore.config';
import { PrintFrormServiceInstance } from '../../services/printTest.serviceInstace';
import { TotalPickedComponent } from './pickup/total-picked/total-picked.component';
import { EntryShipmentServiceInstance } from '../../services/entryShipment.serviceInstace.';

import { PersistenceModule } from 'angular-persistence';
import { ListReceiptMoneyService } from '../../services/receiptMoney.service.';
import { SignalRService } from '../../services/signalR.service';
import { EventListenerServiceInstance } from '../../services/eventListener.serviceInstance';
import { WelcomeRoutingModule } from './welcome.routing';
import { TotalPickupCompleteComponent } from './pickup/total-pickup-complete/total-pickup-complete.component';
import { DateFormatPipe } from '../../pipes/dateFormat.pipe';
import { DateFormatNoTimePipe } from '../../pipes/dateFormatNoTime.pipes';
import { PrintModule } from '../print-form/print.module';
// import { DateFormatPipe } from '../../pipes/dateFormat.pipe';

@NgModule({
    imports: [
        AgmCoreModule.forRoot(AgmCoreConfig),
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        WelcomeRoutingModule,
        ModalModule.forRoot(),
        TabsModule.forRoot(),
        SharedModule,
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
        ChartModule,
        PrintModule
    ],
    declarations: [
        // DateFormatPipe,
        WelcomeComponent,
        TotalNewRequestComponent,
        TotalAssignedPickupComponent,
        TotalPickingComponent,
        TotalPickupCompleteComponent,
        TotalWaitRoutingComponent,
        TotalRoutedComponent,
        TotalTransferPOFromComponent,
        TotalTransferPOToComponent,
        TotalDeliveryComponent,
        TotalUncompleteComponent,
        TotalCompleteComponent,
        TotalReturnComponent,
        TotalInventoryComponent,
        TotalWeightInventoryComponent,
        TotalUnprocessedComponent,
        TotalPickedComponent,
        // DateFormatPipe,
        // DateFormatNoTimePipe
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
        ReportService
    ],
    entryComponents: [
        TotalNewRequestComponent,
        TotalAssignedPickupComponent,
        TotalPickingComponent,
        TotalPickupCompleteComponent,
        TotalWaitRoutingComponent,
        TotalRoutedComponent,
        TotalTransferPOFromComponent,
        TotalTransferPOToComponent,
        TotalDeliveryComponent,
        TotalUncompleteComponent,
        TotalCompleteComponent,
        TotalReturnComponent,
        TotalInventoryComponent,
        TotalWeightInventoryComponent,
        TotalUnprocessedComponent,
        TotalPickedComponent,
    ],
    exports: [
        // DateFormatPipe
    ],
})
export class WelcomeModule { }
