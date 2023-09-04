import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule, BsModalRef } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { ReportManagementRoutingModule } from './report-management.routing';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { TreeTableModule, DataTableModule, SharedModule, DropdownModule, MultiSelectModule, CheckboxModule, CalendarModule, SplitButtonModule, AutoCompleteModule, TriStateCheckboxModule, TabViewModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
//
import { CountryService, ProvinceService, DistrictService, WardService, DepartmentService, UserService, HubService, RequestShipmentService, ShipmentStatusService, ReasonService, ReportService, ShipmentService, ServiceDVGTService, ServiceService, PaymentTypeService, CustomerService } from '../../services';
//
import { KpiComponent } from './kpi/kpi.component';
import { ListUnfinishComponent } from "./list-unfinish/list-unfinish.component";
import { ReportCodComponent } from "./report-cod/report-cod.component";
import { LadingScheduleHistoryComponent } from './lading-schedule-history/lading-schedule-history.component';
import { ReportSumaryComponent } from './report-sumary/report-sumary.component';
import { ReportCustomerComponent } from './report-customer/report-customer.component';
import { ReportPickupDeliverComponent } from './report-pickup-delivery/report-pickup-delivery.component';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ReportPayablesAndReceivablesByCustomerComponent } from './report-payables-and-receivables-customer/report-payables-and-receivables-customer.component';
import { ReportTransferComponent } from './report-transfer/report-transfer.component';
import { LayoutModule } from '../layout/layout.module';
import { ReportDeliveryComponent } from './report-delivery/report-delivery.component';
import { ReportReturnComponent } from './report-return/report-return.component';
import { ReportCodReceivablesComponent } from './report-cod-receivables/report-cod-receivables.component';
import { ReportCodPayableComponent } from './report-cod-payable/report-cod-payable.component';
import { PriceReadyPaymentComponent } from './price-ready-payment/price-ready-payment.component';
import { PrintModule } from '../print-form/print.module';
import { ReportCancelShipmentComponent } from './report-cancel-shipment/report-cancel-shipment.component';
import { ReportCODByCustomerComponent } from './report-cod-by-customer/report-cod-by-customer.component';
import { ReportPostAgeByCustomerComponent } from './report-postage-by-customer/report-postage-by-customer.component';
import { ReportDebtPriceDetailCustomerComponent } from './report-debt-price-detail-customer/report-debt-price-detail-customer.component';
import { ReportDebtCodDetailCustomerComponent } from './report-debt-cod-detail-customer/report-debt-cod-detail-customer.component';
import { ReportListGoodsPriceDetailCustomerComponent } from './report-list-goods-price-detail-customer/report-list-goods-price-detail-customer.component';
import { ReportResultBusinessComponent } from './report-result-business/report-result-business.component';
import { ReportKPIBusinessComponent } from './report-kpi-business/report-kpi-business.component';
import { ReportKPICustomerComponent } from './report-kpi-customer/report-kpi-customer.component';
import { ReportShipmentQuantityComponent } from './report-shipment-quantity/report-shipment-quantity.component';
import { ReportDiscountCustomerComponent } from './report-discount-customer/report-discount-customer.component';
import { ReportComplainComponent } from './report-complain/report-complain.component';
import { ReportPaymentPickupUserComponent } from './report-payment-pickup-user/report-payment-pickup-user.component';
import { ReportShipmentCODComponent } from './report-shipment-cod/report-shipment-cod.component';
import { ReportDeadlineComponent } from './report-deadline/report-deadline.component';
import { ReportLadingScheduleComponent } from './report-lading-schedule/report-lading-schedule.component';
import { ReportTruckTransferComponent } from './report-truck-transfer/report-truck-transfer.component';
import { TruckService } from '../../../app/services/truck.service';
import { ReportEmpReceiptIssueComponent } from './report-emp-receipt-issue/report-emp-receipt-issue.component';
import { ReportPrioritizeComponent } from './report-prioritize/report-prioritize.component';
import { ReportIncidentsComponent } from './report-incidents/report-incidents.component';
import { ReportDeliveryImageComponent } from './report-delivery-image/report-delivery-image.component';
import { ImageViewerModule } from "ngx-image-viewer";
import { ReportCustomerRevenueComponent } from './report-customer-revenue/report-customer-revenue.component';
import { ReportBusinessAnalysisComponent } from './report-business-analysis/report-business-analysis.component';
import { ReportMonthlyRevenueComponent } from './report-monthly-revenue/report-monthly-revenue.component';
import { ReportYearRevenueComponent } from './report-year-revenue/report-year-revenue.component';
import { ReportHandleEmployeeComponent } from './report-handle-employee/report-handle-employee.component';
import { ReportDeliveryDetailComponent } from './report-delivery-detail/report-delivery-detail.component';
import { ReportSumaryShipmentComponent } from './report-sumary-shipment/report-sumary-shipment.component';
import { ReportUpdateReceivedInfoComponent } from './report-update-received-info/report-update-received-info.component';
import { ReportCodConfirmConponent } from './report-cod-confirm/report-cod-confirm.component';
import { ReportEditShipmentComponent } from './report-edit-shipment/report-edit-shipment.component'; 
import { ReportExpenseComponent } from './report-expense/report-expense.component';
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
    ReportManagementRoutingModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    DropzoneModule.forChild(),
    TreeTableModule,
    SharedModule,
    TableModule,
    DataTableModule,
    DropdownModule,
    MultiSelectModule,
    CheckboxModule,
    CalendarModule,
    Daterangepicker,
    LayoutModule,
    SplitButtonModule,
    AutoCompleteModule,
    TriStateCheckboxModule,
    ImageViewerModule,
    TabViewModule
  ],
  declarations: [
    KpiComponent,
    LadingScheduleHistoryComponent,
    ReportCodComponent,
    ListUnfinishComponent,
    ReportCodConfirmConponent,
    ReportSumaryComponent,
    ReportCustomerComponent,
    ReportPickupDeliverComponent,
    ReportPayablesAndReceivablesByCustomerComponent,
    ReportTransferComponent,
    ReportDeliveryComponent,
    ReportCodReceivablesComponent,
    ReportCodPayableComponent,
    PriceReadyPaymentComponent,
    ReportCancelShipmentComponent,
    ReportCODByCustomerComponent,
    ReportPostAgeByCustomerComponent,
    ReportDebtPriceDetailCustomerComponent,
    ReportDebtCodDetailCustomerComponent,
    ReportListGoodsPriceDetailCustomerComponent,
    ReportResultBusinessComponent,
    ReportKPIBusinessComponent,
    ReportKPICustomerComponent,
    ReportShipmentQuantityComponent,
    ReportDiscountCustomerComponent,
    ReportComplainComponent,
    ReportPaymentPickupUserComponent,
    ReportShipmentCODComponent,
    ReportDeadlineComponent,
    ReportLadingScheduleComponent,
    ReportTruckTransferComponent,
    ReportEmpReceiptIssueComponent,
    ReportPrioritizeComponent,
    ReportIncidentsComponent,
    //
    ReportReturnComponent,
    ReportDeliveryImageComponent,
    ReportCustomerRevenueComponent,
    ReportBusinessAnalysisComponent,
    ReportMonthlyRevenueComponent,
    ReportYearRevenueComponent,
    ReportHandleEmployeeComponent,
    ReportDeliveryDetailComponent,
    ReportSumaryShipmentComponent,
    ReportUpdateReceivedInfoComponent,
    ReportEditShipmentComponent,
    ReportExpenseComponent
  ],
  exports:  [
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
    ReportService,
    ServiceDVGTService,
    ShipmentService,
    PaymentTypeService,
    ServiceService,
    CustomerService,
    PaymentTypeService,
    CustomerService,
    TruckService,
    BsModalRef
  ]

})
export class ReportManagementModule { }
