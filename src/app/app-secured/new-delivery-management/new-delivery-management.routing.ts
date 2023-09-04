import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
import { WaitAssignDeliveryComponent } from './wait-assign-delivery/wait-assign-delivery.component';
import { AssignedDeliveryComponent } from './assigned-delivery/assigned-delivery.component';
import { UpdateDeliveryStatusComponent } from './update-delivery-status/update-delivery-status.component';
import { DeliveryFailComponent } from './delivery-fail/delivery-fail.component';
import { ListDeliveryCancelComponent } from './list-delivery-cancel/list-delivery-cancel.component';
import { ListDeliveryCompleteComponent } from './list-delivery-complete/list-delivery-complete.component';
import { DeleteDeliveryCompleteComponent } from './delete-delivery-complete/delete-delivery-complete.component';
import { EditDeliveryCompleteComponent } from './edit-delivery-complete/edit-delivery-complete.component';
import { DeliveryIssueComponent } from './delivery-issue/delivery-issue.component';
//

const routes: Routes =  [
    { path: Constant.pages.deliveryManagement.children.waitAssignDelivery.alias, component: WaitAssignDeliveryComponent },
    { path: Constant.pages.deliveryManagement.children.assignedDelivery.alias, component: AssignedDeliveryComponent },
    { path: Constant.pages.deliveryManagement.children.updateDeliveryStatus.alias, component: UpdateDeliveryStatusComponent },
    { path: Constant.pages.deliveryManagement.children.deliveryFail.alias, component: DeliveryFailComponent },
    { path: Constant.pages.deliveryManagement.children.listDeliveryCancel.alias, component: ListDeliveryCancelComponent },
    { path: Constant.pages.deliveryManagement.children.listDeliveryComplete.alias, component: ListDeliveryCompleteComponent },
    { path: Constant.pages.deliveryManagement.children.deleteDeliveryComplate.alias, component: DeleteDeliveryCompleteComponent },
    { path: Constant.pages.deliveryManagement.children.editDeliveryComplate.alias, component: EditDeliveryCompleteComponent },
    { path: Constant.pages.deliveryManagement.children.deliveryIssue.alias, component: DeliveryIssueComponent },
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports:[RouterModule],
  declarations: []
})
export class NewDeliveryManagementRoutingModule { }
