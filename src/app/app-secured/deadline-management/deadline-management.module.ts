import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { DeadlineManagementRouting } from './deadline-management.routing';
import { TreeTableModule, DataTableModule, DropdownModule, MultiSelectModule, CheckboxModule, CalendarModule } from 'primeng/primeng';
//
import { ReasonService, DeadlinePickupDeliveryService, DeadlinePickupDeliveryDetailService, CustomerService, WardService } from '../../services';
import { AreaGroupService } from '../../services';
import {
  WeightGroupService, HubService, FormulaService, WeightService,
  AreaService, ProvinceService, DistrictService, PriceListService, PriceServiceService, ServiceDVGTPriceService,
  ServiceService, ServiceDVGTService, PriceServiceDetailService, ChargedCODService, ChargedRemomteService
} from '../../services';
//
import { DeadlinePickupDeliveryComponent } from './deadline-pickup-delivery/deadline-pickup-delivery.component';
import { DeadlinePickupDeliveryDetailExcelComponent } from './deadline-pickup-delivery-detail-excel/deadline-pickup-delivery-detail-excel.component';
import { SharedModule } from "../../shared/shared.module";
// import { DateFormatPipe } from '../../pipes/dateFormat.pipe';
import { PrintModule } from '../print-form/print.module';
import { TableModule } from '../../../../node_modules/primeng/table';
import { KPIShipmentServices } from '../../services/KPIShipment.service';
import { KPIShipmentDetailServices } from '../../services/KPIShipmentDetail.service';
import { CreateDeadlinePickupDeliveryDetailExcelComponent } from './create-deadline-pickup-delivery-detail-excel/create-deadline-pickup-delivery-detail-excel.component';
import { EditDeadlinePickupDeliveryDetailExcelComponent } from './edit-deadline-pickup-delivery-detail-excel/edit-deadline-pickup-delivery-detail-excel.component';

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
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    DropzoneModule.forRoot(DROPZONE_CONFIG),
    TreeTableModule,
    DataTableModule,
    DropdownModule,
    MultiSelectModule,
    CheckboxModule,
    SharedModule,
    CalendarModule,
    DeadlineManagementRouting,
    TableModule
  ],
  declarations: [
    DeadlinePickupDeliveryComponent,
    DeadlinePickupDeliveryDetailExcelComponent,
    CreateDeadlinePickupDeliveryDetailExcelComponent,
    EditDeadlinePickupDeliveryDetailExcelComponent,
    // DateFormatPipe
  ],
  entryComponents: [
  ],
  providers: [
    ReasonService,
    AreaGroupService,
    WeightGroupService,
    HubService,
    FormulaService,
    WeightService,
    AreaService,
    ProvinceService,
    DistrictService,
    PriceListService,
    PriceServiceService,
    ServiceDVGTPriceService,
    ServiceService,
    ServiceDVGTService,
    PriceServiceDetailService,
    ChargedCODService,
    ChargedRemomteService,
    DeadlinePickupDeliveryService,
    DeadlinePickupDeliveryDetailService,
    KPIShipmentServices,
    KPIShipmentDetailServices,
    CustomerService,
    WardService,
  ]
})
export class DeadlineManagementModule { }
