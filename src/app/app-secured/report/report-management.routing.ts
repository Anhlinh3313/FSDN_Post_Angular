import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
//
import { KpiComponent } from "./kpi/kpi.component";
import { ReportCodComponent } from "./report-cod/report-cod.component";
import { ListUnfinishComponent } from "./list-unfinish/list-unfinish.component";
import { LadingScheduleHistoryComponent } from './lading-schedule-history/lading-schedule-history.component';
import { ReportSumaryComponent } from './report-sumary/report-sumary.component';
import { ReportCustomerComponent } from './report-customer/report-customer.component';
import { ReportPickupDeliverComponent } from './report-pickup-delivery/report-pickup-delivery.component';
import { ReportPayablesAndReceivablesByCustomerComponent } from './report-payables-and-receivables-customer/report-payables-and-receivables-customer.component';
import { ReportTransferComponent } from './report-transfer/report-transfer.component';
import { ReportDeliveryComponent } from './report-delivery/report-delivery.component';
import { ReportReturnComponent } from './report-return/report-return.component';
import { ReportCodReceivablesComponent } from './report-cod-receivables/report-cod-receivables.component';
import { ReportCodPayableComponent } from './report-cod-payable/report-cod-payable.component';
import { PriceReadyPaymentComponent } from './price-ready-payment/price-ready-payment.component';
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
import { ReportLadingScheduleComponent } from './report-lading-schedule/report-lading-schedule.component';
import { ReportTruckTransferComponent } from './report-truck-transfer/report-truck-transfer.component';
import { ReportEmpReceiptIssueComponent } from './report-emp-receipt-issue/report-emp-receipt-issue.component';
import { ReportPaymentPickupUserComponent } from './report-payment-pickup-user/report-payment-pickup-user.component';
import { ReportShipmentCODComponent } from './report-shipment-cod/report-shipment-cod.component';
import { ReportDeadlineComponent } from './report-deadline/report-deadline.component';
import { ReportPrioritizeComponent } from './report-prioritize/report-prioritize.component';
import { ReportIncidentsComponent } from './report-incidents/report-incidents.component';
import { ReportDeliveryImageComponent } from './report-delivery-image/report-delivery-image.component';
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


const routes: Routes =  [
    { path: Constant.pages.report.children.kpi.alias, component: KpiComponent },
    { path: Constant.pages.report.children.ladingSchedule.alias, component: LadingScheduleHistoryComponent },
    { path: Constant.pages.report.children.reportCod.alias, component: ReportCodComponent },
    { path: Constant.pages.report.children.reportCODConfirm.alias, component: ReportCodConfirmConponent },
    { path: Constant.pages.report.children.listUnfinish.alias, component: ListUnfinishComponent },
    { path: Constant.pages.report.children.reportSumary.alias, component: ReportSumaryComponent },
    { path: Constant.pages.report.children.reportSumaryShipment.alias, component: ReportSumaryShipmentComponent },
    { path: Constant.pages.report.children.reportCustomer.alias, component: ReportCustomerComponent },
    { path: Constant.pages.report.children.reportPickupDeliver.alias, component: ReportPickupDeliverComponent },
    { path: Constant.pages.report.children.reportPayablesAndReceivablesByCustomer.alias, component: ReportPayablesAndReceivablesByCustomerComponent },
    { path: Constant.pages.report.children.reportTransfer.alias, component: ReportTransferComponent },
    { path: Constant.pages.report.children.reportDelivery.alias, component: ReportDeliveryComponent },
    { path: Constant.pages.report.children.reportCODReceivables.alias, component: ReportCodReceivablesComponent },
    { path: Constant.pages.report.children.reportCODPayable.alias, component: ReportCodPayableComponent },
    { path: Constant.pages.report.children.priceReadyPayment.alias, component: PriceReadyPaymentComponent },
    { path: Constant.pages.report.children.cancelShipment.alias, component: ReportCancelShipmentComponent },
    { path: Constant.pages.report.children.ReportCODByCustomer.alias, component: ReportCODByCustomerComponent },
    { path: Constant.pages.report.children.ReportPostAgeByCustomer.alias, component: ReportPostAgeByCustomerComponent },
    { path: Constant.pages.report.children.reportDebtPriceDetailByCustomer.alias, component: ReportDebtPriceDetailCustomerComponent },
    { path: Constant.pages.report.children.reportDebtCODDetailByCustomer.alias, component: ReportDebtCodDetailCustomerComponent },
    { path: Constant.pages.report.children.reportListGoodsPriceDetailCustomer.alias, component: ReportListGoodsPriceDetailCustomerComponent },
    { path: Constant.pages.report.children.reportResultBusiness.alias, component: ReportResultBusinessComponent },
    { path: Constant.pages.report.children.reportKPIBusiness.alias, component: ReportKPIBusinessComponent },
    { path: Constant.pages.report.children.reportKPICustomer.alias, component: ReportKPICustomerComponent },
    { path: Constant.pages.report.children.reportShipmentQuantity.alias, component: ReportShipmentQuantityComponent },
    { path: Constant.pages.report.children.reportDiscountCustomer.alias, component: ReportDiscountCustomerComponent },
    { path: Constant.pages.report.children.reportComplain.alias, component: ReportComplainComponent },
    { path: Constant.pages.report.children.reportPaymentPickupUser.alias, component: ReportPaymentPickupUserComponent },
    { path: Constant.pages.report.children.reportShipmentCOD.alias, component: ReportShipmentCODComponent },
    { path: Constant.pages.report.children.reportDeadline.alias, component: ReportDeadlineComponent },
    { path: Constant.pages.report.children.reportLadingSchedule.alias, component: ReportLadingScheduleComponent },
    { path: Constant.pages.report.children.reportTruckTransfer.alias, component: ReportTruckTransferComponent },
    { path: Constant.pages.report.children.reportEmpReceiptIssue.alias, component: ReportEmpReceiptIssueComponent },
    { path: Constant.pages.report.children.reportPrioritize.alias, component: ReportPrioritizeComponent },
    { path: Constant.pages.report.children.reportIncidents.alias, component: ReportIncidentsComponent },
    { path: Constant.pages.report.children.reportDeliveryImage.alias, component: ReportDeliveryImageComponent },
    //
    { path: Constant.pages.report.children.reportReturn.alias, component: ReportReturnComponent },
    { path: Constant.pages.report.children.reportCustomerRevenue.alias, component: ReportCustomerRevenueComponent },
    { path: Constant.pages.report.children.reportBusinessAnalysis.alias, component: ReportBusinessAnalysisComponent },
    { path: Constant.pages.report.children.reportMonthlyRevenue.alias, component: ReportMonthlyRevenueComponent },
    { path: Constant.pages.report.children.reportYearRevenue.alias, component: ReportYearRevenueComponent },
    { path: Constant.pages.report.children.reportHandleEmployee.alias, component: ReportHandleEmployeeComponent },
    { path: Constant.pages.report.children.reportDeliveryDetail.alias, component: ReportDeliveryDetailComponent },
    { path: Constant.pages.report.children.reportUpdateReceivedInfo.alias, component: ReportUpdateReceivedInfoComponent },
    { path: Constant.pages.report.children.reportEditShipment.alias, component: ReportEditShipmentComponent },
    { path: Constant.pages.report.children.reportCosts.alias, component: ReportExpenseComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class ReportManagementRoutingModule { }
