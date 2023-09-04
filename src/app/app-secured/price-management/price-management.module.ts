import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { PriceManagementRoutingModule } from './price-management.routing';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { TreeTableModule, DataTableModule, DropdownModule, MultiSelectModule, CheckboxModule, SpinnerModule, InputSwitchModule, AutoCompleteModule } from 'primeng/primeng';
import { NgSelectModule } from '@ng-select/ng-select';
//
import { ReasonService, StructureService, PackTypeService, CalculateByService, PriceService, PricingTypeService, CustomerPriceListDVGTService, CustomerService, WardService} from '../../services';
import { AreaGroupService } from '../../services';
import {
  WeightGroupService, HubService, FormulaService, WeightService,
  AreaService, ProvinceService, DistrictService, PriceListService, PriceServiceService, ServiceDVGTPriceService,
  ServiceService, ServiceDVGTService, PriceServiceDetailService, ChargedCODService, ChargedRemomteService
} from '../../services';
//
import { AreaGroupComponent } from './area-group/area-group.component';
import { AreaComponent } from './area/area.component';
import { WeightGroupComponent } from './weight-group/weight-group.component';
import { WeightComponent } from './weight/weight.component';
import { FormulaComponent } from './formula/formula.component';
import { PriceListComponent } from './price-list/price-list.component';
import { PriceServiceComponent } from './price-service/price-service.component';
import { ServiceDVGTPriceComponent } from './service-dvgt-price/service-dvgt-price.component';
import { PriceServiceDetailComponent } from './price-service-detail/price-service-detail.component';
import { PriceServiceDetailExcelComponent } from './price-service-detail-excel/price-service-detail-excel.component';
import { ChargedCODComponent } from './charged-cod/charged-cod.component';
import { ChargedRemoteComponent } from './charged-remote/charged-remote.component';
import { SharedModule } from "../../shared/shared.module";
import { PrintModule } from '../print-form/print.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import {CalendarModule} from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { ServiceDVGTPriceDetailComponent } from './service-dvgt-price-detail/service-dvgt-price-detail.component';
import { PriceListDVGTService } from '../../services/price-list-dvgt.service';
import { PackagePriceListComponent } from './package-price-list/package-price-list.component';
import { PackagePriceService } from '../../services/packagePrice.service';
import { CheckPriceComponent } from './check-price/check-price.component';
import { CustomerPriceServiceService } from '../../services/customer-price-service.service';
import { CurrencyFormatPipe } from '../../pipes/currencyFormat.pipe';

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
    NgSelectModule,
    FormsModule,
    PriceManagementRoutingModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    DropzoneModule.forRoot(DROPZONE_CONFIG),
    TreeTableModule,
    SharedModule,
    DataTableModule,
    TableModule,
    DropdownModule,
    MultiSelectModule,
    CheckboxModule,
    SharedModule,
    Daterangepicker,
    CalendarModule,
    SpinnerModule,
    InputSwitchModule,
    AutoCompleteModule
  ],
  declarations: [
    AreaGroupComponent,
    AreaComponent,
    WeightGroupComponent,
    WeightComponent,
    FormulaComponent,
    PriceListComponent,
    PriceServiceComponent,
    ServiceDVGTPriceComponent,
    ServiceDVGTPriceDetailComponent,
    PriceServiceDetailComponent,
    PriceServiceDetailExcelComponent,
    ChargedCODComponent,
    ChargedRemoteComponent,
    PackagePriceListComponent,
    CheckPriceComponent,
    // CurrencyFormatPipe
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
    WardService,
    PriceListService,
    PriceServiceService,
    ServiceDVGTPriceService,
    ServiceService,
    ServiceDVGTService,
    PriceServiceDetailService,
    ChargedCODService,
    ChargedRemomteService,
    StructureService,
    PriceListDVGTService,
    PackagePriceService,
    PackTypeService,
    CalculateByService,
    PriceService,
    CustomerPriceServiceService,
    PricingTypeService,
    CustomerPriceListDVGTService,
    CustomerService,
    CurrencyFormatPipe,
  ]
})
export class PriceManagementModule { }
