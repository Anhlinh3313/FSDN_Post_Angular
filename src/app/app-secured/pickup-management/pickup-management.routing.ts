import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
//
import { PickupComponent } from './pickup/pickup.component';
import { UpdatePickupStatusComponent } from './update-pickup-status/update-pickup-status.component';
import { HistoryPickupComponent } from './history-pickup/historypickup.component';

const routes: Routes =  [
    { path: Constant.pages.pickup.children.pickup.alias, component: PickupComponent },
    { path: Constant.pages.pickup.children.updatePickupStatus.alias, component: UpdatePickupStatusComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports:[RouterModule],
  declarations: []
})
export class PickupManagementRoutingModule { }
