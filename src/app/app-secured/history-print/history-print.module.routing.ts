import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
import { FollowListComponent } from './follow-list/follow-list.component';
import { ReportPrintShipmentComponent } from './report-print-shipment/report-print-shipment.component';


const routes: Routes =  [
    { path: Constant.pages.historyPrint.children.followList.alias, component: FollowListComponent },
    { path: Constant.pages.historyPrint.children.printShipments.alias, component: ReportPrintShipmentComponent },
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports:[RouterModule],
  declarations: []
})
export class HistotyPrintRoutingModule { }
