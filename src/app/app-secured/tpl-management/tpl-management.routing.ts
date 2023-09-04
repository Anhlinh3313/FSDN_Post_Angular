import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
//
import { TPLComponent } from './tpl/tpl.component'
import { ShipmentAssignToTPL } from './shipment-assign-to-tpl/shipment-assign-to-tpl.component'
import { UpdateScheduleComponent } from './update-schedule/update-schedule.component';
import { TPLShipmentComponent } from './tpl-shipment/tpl-shipment.component';

const routes: Routes = [
  { path: Constant.pages.tpl.children.tplManagement.alias, component: TPLComponent },
  { path: Constant.pages.tpl.children.shipmentAssignToTPL.alias, component: ShipmentAssignToTPL },
  { path: Constant.pages.tpl.children.updateSchedule.alias, component: UpdateScheduleComponent },
  { path: Constant.pages.tpl.children.shipmentTPL.alias, component: TPLShipmentComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class TPLManagementRoutingModule { }
