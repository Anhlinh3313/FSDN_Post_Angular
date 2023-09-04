import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../shared/guard/auth.guard';
import { Constant } from '../infrastructure/constant';

//Component
import { AppSecuredComponent } from './app-secured.component'
import { HelloComponent } from './hello/hello.component';

const appRoutes: Routes = [
  {
    path: '', component: AppSecuredComponent, canActivate: [AuthGuard], canActivateChild: [AuthGuard], children: [
      { path: '', component: HelloComponent },
      {
        path: Constant.pages.changePassWord.alias, loadChildren: './change-password/change-password.module#ChangePasswordModule'
      },
      {
        path: Constant.pages.dashBoard.alias, loadChildren: './welcome/welcome.module#WelcomeModule'
      },
      {
        path: Constant.pages.pickup.alias, loadChildren: './pickup-management/pickup-management.module#PickupManagementModule'
      },
      {
        path: Constant.pages.pack.alias, loadChildren: './pack-management/pack-management.module#PackManagementModule'
      },
      {
        path: Constant.pages.delivery.alias, loadChildren: './delivery-management/delivery-management.module#DeliveryManagementModule'
      },
      {
        path: Constant.pages.transfer.alias, loadChildren: './transfer-management/transfer-management.module#TransferManagementModule'
      },
      {
        path: Constant.pages.return.alias, loadChildren: './return-management/return-management.module#ReturnManagementModule'
      },
      {
        path: Constant.pages.general.alias, loadChildren: './general-management/general-management.module#GeneralManagementModule'
      },
      {
        path: Constant.pages.price.alias, loadChildren: './price-management/price-management.module#PriceManagementModule'
      },
      {
        path: Constant.pages.request.alias, loadChildren: './request-management/request-management.module#RequestManagementModule'
      },
      {
        path: Constant.pages.shipment.alias, loadChildren: './shipment-management/shipment-management.module#ShipmentManagementModule'
      },
      {
        path: Constant.pages.report.alias, loadChildren: './report/report-management.module#ReportManagementModule'
      },
      {
        path: Constant.pages.receiptMoney.alias, loadChildren: './receive-money-management/receive-money-management.module#ReceiveMoneyManagementModule'
      },
      {
        path: Constant.pages.gpsLocation.alias, loadChildren: './gps-location/gps-location.module#GpsLocationModule'
      },
      {
        path: Constant.pages.customerPayment.alias, loadChildren: './customer-payment-management/customer-payment-management.module#CustomerPaymentManagementModule'
      },
      {
        path: Constant.pages.tpl.alias, loadChildren: './tpl-management/tpl-management.module#TPLManagementModule'
      },
      {
        path: Constant.pages.deadline.alias, loadChildren: './deadline-management/deadline-management.module#DeadlineManagementModule'
      },
      {
        path: Constant.pages.pickupManagement.alias, loadChildren: './new-pickup-management/new-pickup-management.module#NewPickupManagementModule'
      },
      {
        path: Constant.pages.warehouse.alias, loadChildren: './warehouse-management/warehouse-management.module#WarehouseManagementModule'
      },
      {
        path: Constant.pages.deliveryManagement.alias, loadChildren: './new-delivery-management/new-delivery-management.module#NewDeliveryManagementModule'
      },
      {
        path: Constant.pages.historyPrint.alias, loadChildren:  "./history-print/history-print.module#HistoryPrintModule"
      },
      {
        path: Constant.pages.billOfLading.alias, loadChildren: './bill-of-lading/bill-of-lading.module#BillOfLadingModule'
      },
      { 
        path: Constant.pages.quanLyChuyen_VanChuyen.alias, loadChildren: './quan-ly-chuyen-van-chuyen/quan-ly-chuyen-van-chuyen.module#QuanLyChuyenVanChuyenModule'
      },
      // {
      //   path: Constant.pages.codManagement.alias, loadChildren: './cod-management/cod-management.module#CodManagementModule'
      // },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(appRoutes)
  ],
  exports: [RouterModule],
  declarations: [],
})
export class AppSecuredRoutingModule { }

