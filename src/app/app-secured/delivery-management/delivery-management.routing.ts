import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
import { DeliveryHistoryComponent } from './delivery-history/delivery-history.component';

//
import { DeliveryMagementComponent } from './delivery-managment/delivery-management.component';
import { UpdateDeliveryStatusComponent } from './update-delivery-status/update-delivery-status.component';

const routes: Routes =  [
    { path: Constant.pages.delivery.children.delivery.alias, component: DeliveryMagementComponent },
    { path: Constant.pages.delivery.children.updateDeliveryStatus.alias, component: UpdateDeliveryStatusComponent },
    { path: Constant.pages.delivery.children.deliveryHistory.alias, component: DeliveryHistoryComponent },
    
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports:[RouterModule],
  declarations: []
})
export class DeliveryManagementRoutingModule { }
