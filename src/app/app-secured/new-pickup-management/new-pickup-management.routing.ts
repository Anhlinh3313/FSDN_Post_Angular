import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
import { WaitAssignPickupComponent } from './wait-assign-pickup/wait-assign-pickup.component';
import { AssignedPickupComponent } from './assigned-pickup/assigned-pickup.component';
import { ListPickingComponent } from './list-picking/list-picking.component';
import { ListPickupCancelComponent } from './list-pickup-cancel/list-pickup-cancel.component';
import { ListPickupCompleteComponent } from './list-pickup-complete/list-pickup-complete.component';
import { CreateRequestComponent } from './create-request/create-request.component';
import { RequestManagementComponent } from '../request-management/request-management/request-management.component';
//

const routes: Routes =  [
    { path: Constant.pages.pickupManagement.children.createRequest.alias, component: CreateRequestComponent },
    { path: Constant.pages.pickupManagement.children.waitAssignPickup.alias, component: WaitAssignPickupComponent },
    { path: Constant.pages.pickupManagement.children.assignedPickup.alias, component: AssignedPickupComponent },
    { path: Constant.pages.pickupManagement.children.listPicking.alias, component: ListPickingComponent },
    { path: Constant.pages.pickupManagement.children.listPickupCancel.alias, component: ListPickupCancelComponent },
    { path: Constant.pages.pickupManagement.children.listPickupComplete.alias, component: ListPickupCompleteComponent },
    { path: Constant.pages.request.children.listRequest.alias, component: RequestManagementComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports:[RouterModule],
  declarations: []
})
export class NewPickupManagementRoutingModule { }
